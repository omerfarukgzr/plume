# Görseller ve yükleme

Görseller yeniden boyutlandırılabilir (köşedeki tutamacı sürükleyin), hizalanabilir,
altına açıklama yazılabilir ve silinebilir. Bir görseli seçtiğinizde çıkan küçük menü
hizalama, açıklama ve silme seçeneklerini sunar; açıklamayı da doğrudan görselin altında
yazarsınız. İster toolbar düğmesiyle ekleyin, ister yapıştırın, ister sürükleyip bırakın —
hepsi aynı yoldan geçer: önce dosya doğrulanır, hemen geçici bir önizleme gösterilir,
yükleme bitince de yerine son URL konur.

## Hiç ayar yapmadan

`uploadHandler` vermezseniz; seçtiğiniz, yapıştırdığınız ya da bıraktığınız görseller
base64 data URL olarak doğrudan belgeye gömülür. Yani hiçbir kurulum gerekmez. Demolar ve
HTML'i olduğu gibi saklayan uygulamalar için pratik bir yoldur; ama görseli belgenin
içine gömdüğü için kaydedilen içeriği şişirir. Gerçek projelerde görselleri kendi
sunucunuza yüklemenizi öneririz.

## Kendi sunucunuza yükleme

Bunun hazır yolu `createUploadHandler`. Dosyayı `multipart/form-data` olarak POST eder ve
sonucu dönen JSON yanıtından okur.

```tsx
import { createUploadHandler } from '@plume/core'
;<PlumeEditor
  image={{
    uploadHandler: createUploadHandler({
      url: '/api/upload',
      // fieldName: 'file',           // form alanının adı (varsayılan 'file')
      // headers: { Authorization },  // ek istek başlıkları
      // maxSize: 5 * 1024 * 1024,    // büyük dosyaları daha istemcide reddet
      // parseResponse: (json) => ({ src: json.url, width: json.width }),
    }),
    // accept, maxSize, labels (dil), bubbleMenu ve onError de ayarlanabilir.
  }}
/>
```

Daha fazla kontrol isterseniz (S3 imzalı URL, tRPC vb.) kendi async fonksiyonunuzu
verebilirsiniz:

```ts
uploadHandler: (file: File) => Promise<{ src: string; width?: number; alt?: string }>
```

## Sunucu tarafının uyması gerekenler

Backend'i yazan kişinin tek bilmesi gereken şu:

- **İstek:** `POST <url>`, `Content-Type: multipart/form-data`, dosya `file` alanında
  (bu alan adını `fieldName` ile değiştirebilirsiniz).
- **Yanıt:** `200` ve şu biçimde JSON: `{ "src": "https://…", "width"?: number, "alt"?: string }`.
- **Hata:** 2xx dışında herhangi bir durum kodu. İsterseniz `{ "error": "mesaj" }`
  döndürün; bu mesaj `onError`'a düşer.

### Express (`multer` ile)

```js
import express from 'express'
import multer from 'multer'

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } })
const app = express()

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya gelmedi' })
  // req.file'ı istediğiniz yere (disk, S3 vb.) kaydedip herkese açık URL'sini döndürün.
  res.json({ src: `/uploads/${req.file.filename}` })
})

app.listen(3000)
```

### Go (standart kütüphane)

```go
func upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(5 << 20); err != nil { // 5 MiB
		writeErr(w, http.StatusBadRequest, "Dosya çok büyük")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeErr(w, http.StatusBadRequest, "Dosya gelmedi")
		return
	}
	defer file.Close()

	name := filepath.Base(header.Filename)
	dst, _ := os.Create(filepath.Join("uploads", name))
	defer dst.Close()
	io.Copy(dst, file)

	json.NewEncoder(w).Encode(map[string]string{"src": "/uploads/" + name})
}
```

## Öksüz (orphan) kalan görselleri temizleme

Görseller kendi sunucunuzda saklanmaya başlayınca klasik bir sorunla
karşılaşırsınız: kullanıcı bir görsel yükler, sonra onu belgeden siler — ya da
belgeyi hiç kaydetmez. Dosya hâlâ sunucunuzdadır ama artık hiçbir şey ona
referans vermez. Zamanla bu **öksüz** dosyalar birikir.

::: tip Buna ihtiyacınız yok mu?
Yüklenen her dosyanın sunucunuzda kalıcı olarak durması sizin için sorun
değilse, **bu bölümün tamamını atlayabilirsiniz**. Plume yine her yüklemeye bir
kimlik ekler ama siz bunu görmezden gelebilirsiniz — başka hiçbir şey değişmez,
yükleme çalışmaya devam eder.
:::

### "Node silinince dosyayı sil" neden işe yaramaz

Akla ilk gelen çözüm — bir görsel node'u belgeden çıktığında `DELETE` isteği
atmak — iki yönde de güvenilmezdir:

- **Geri al/yinele (undo/redo):** kullanıcı görseli siler (dosya gitti), sonra
  geri alır — node geri gelir ama dosya çoktan silinmiştir. Artık `src` kırıktır.
- **Kes & yapıştır:** kesmek _sil sonra yeniden ekle_ demektir; dosya taşıma
  sırasında silinir.
- **Birden fazla referans:** aynı görsel iki yere kopyalanmışsa, birini silmek
  diğerinin hâlâ gösterdiği dosyayı kaldırmamalıdır.
- **Sekme kapandı / çöktü:** silme sinyali hiç gitmeyebilir — yani bu yöntem her
  öksüzü yakalayamaz bile.

Yani bu yaklaşım hem **fazla siler** (undo, paylaşılan dosya) hem **eksik
temizler** (sekme kapanması).

### Güvenilir yol: kaydederken uzlaştırma (reconciliation)

Silmeleri gerçek zamanlı takip etmeyin. Bunun yerine **kaydetme anında**, belgenin
gerçekten neye referans verdiğini sakladıklarınızla karşılaştırın ve gerisini
temizleyin. Plume bunu, her yüklemeye verdiği kalıcı bir **asset id** ile mümkün
kılar:

1. Bir dosya sunucunuza yüklendiğinde (yani bir `uploadHandler` tanımladığınızda)
   Plume istemci tarafında bir kimlik üretir (`crypto.randomUUID()`).
2. Bu kimlik, upload uç noktanıza **`assetId`** form alanında gönderilir; böylece
   dosyayı o kimlik altında saklayabilirsiniz.
3. Aynı kimlik, kaydedilen HTML'de `<figure>` üzerine **`data-asset-id`** olarak
   yazılır:

   ```html
   <figure data-type="plume-image" data-asset-id="9f1c…" data-align="center">
     <img src="https://cdn.example.com/9f1c….jpg" />
   </figure>
   ```

Yani backend'inizin tek yapması gereken iki şey var:

- **Yüklemede:** `assetId` alanını okuyun ve dosyayı o kimlik altında saklayın
  (şimdilik `bekliyor` / referanssız olarak işaretleyin).
- **Kaydetmede:** saklamak üzere olduğunuz HTML'den `data-asset-id` değerlerini
  ayıklayın — bu, hâlâ kullanılan asset kümesidir. Bu kümede _olmayan_ her
  yüklenmiş asset bir öksüzdür: silinmek üzere işaretleyin ve periyodik bir iş
  (bir cron) işaretlenenleri süpürsün.

```js
// Kaydederken: bu belge hâlâ hangi asset'lere referans veriyor?
const used = new Set([...html.matchAll(/data-asset-id="([^"]+)"/g)].map((m) => m[1]))

// Bu belge için sakladığınız ama `used` içinde olmayan her şey öksüzdür.
await db.assets.update({ documentId, id: { notIn: [...used] } }, { pendingDelete: true })
// Bir cron daha sonra pendingDelete = true olan dosyaları siler (bir süre tanıyıp).
```

#### Listeyi istemciden göndermek

Sunucuda HTML parse etmek istemiyorsanız, `collectImageAssetIds` editörü gezip
kullanılan kimlikleri doğrudan verir — kaydederken yanında gönderin:

```ts
import { collectImageAssetIds } from '@plume/core'

async function save(editor) {
  await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: editor.getHTML(),
      usedAssetIds: collectImageAssetIds(editor), // örn. ['9f1c…', 'a2b…']
    }),
  })
}
```

Tekilleştirilmiş bir dizi döner ve kimliksiz görselleri (base64 ya da dışarıdan
yapıştırılanları) atlar; böylece liste tam olarak sunucunuzun sahibi olduğu ve
koruması gereken yüklemelerden oluşur. Backend mantığı yukarıdakiyle aynı —
sadece HTML üzerinde regex yerine `usedAssetIds` kullanırsınız.

Yalnızca belgenin son hâline baktığı için, tüm zorlu durumlarda otomatik olarak
doğru çalışır:

| Senaryo                                              | Sonuç                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Görsel silindi, sonra **geri alındı**                | kimlik belgede yine var → korunur ✅                         |
| **Kes & yapıştır** / taşıma                          | kayıtta kimlik hâlâ var → korunur ✅                         |
| Aynı görsel iki yere **kopyalandı**                  | kimlik en az bir kez geçiyor → korunur ✅                    |
| **Harici** görsel yapıştırıldı (`data-asset-id` yok) | sizin asset'iniz değil → yoksayılır ✅                       |
| Görsel yüklendi ama **belge hiç kaydedilmedi**       | kimlik hiç "kullanılıyor" diye bildirilmez → cron süpürür ✅ |

### Kimliği sunucu üretsin?

Varsayılan olarak kimlik istemcide üretilir; ama saklama katmanınız kendi
kimliğini üretiyorsa (bir S3 anahtarı, bir veritabanı satır id'si…) bunu
handler'dan döndürün; istemcininkini geçersiz kılar ve yine `data-asset-id`'ye
yazılır:

```ts
uploadHandler: async (file, { assetId }) => {
  const stored = await uploadToS3(file) // saklama katmanınız bir anahtar döner
  return { src: stored.url, id: stored.key } // `id`, istemci kimliğini geçersiz kılar
}
```

Form alanının adını `assetIdFieldName` ile değiştirebilir veya kapatabilirsiniz
(varsayılan `'assetId'`; tamamen çıkarmak için `null` verin).
