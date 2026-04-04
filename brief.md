Kendim için kullanacağım, tek kullanıcı odaklı, basit ama şık bir workout player web sayfası geliştir.

Amaç:
15 dakikalık express kalistenik + hafif kardiyo antrenmanını web sayfasında başlatıp, adım adım takip edebileceğim bir arayüz oluşturmak.

Önemli bağlam:
- Bu proje kişisel kullanım için
- Scalable yapı gerekmiyor
- Öncelik: hızlı çalışan, temiz, kullanışlı bir MVP
- Ancak hareketleri ve süreleri sonradan kendim rahatça değiştirebilmeliyim
- Default olarak aşağıda verdiğim egzersiz planı yüklü gelsin
- Sonradan planı düzenleyebileyim
- Gereksiz backend, auth, veritabanı istemiyorum

Teknik tercih:
- React + Next.js veya sade React, en pratik olanı seç
- TypeScript kullan
- Responsive olsun
- Koyu tema kullan
- Modern, sade, premium hissiyatlı bir workout player UI tasarla
- Kod anlaşılır ve modüler olsun
- Gereksiz over-engineering yapma
- Veriler local state ve localStorage ile yönetilebilir

Ana istek:
Uygulama iki temel mod içersin:
1. Workout Player
2. Plan Editörü

Uygulama açıldığında default plan yüklü gelsin.
Ben istersem bu planı düzenleyebileyim.

Plan editörü özellikleri:
- Hareket ekleme
- Hareket silme
- Hareket sırasını değiştirme
- Hareket adını değiştirme
- Hareket süresini değiştirme
- Hareket tipini değiştirme: "exercise" | "rest"
- Fazını değiştirme: "warmup" | "main" | "cooldown" | "rest"
- Round bilgisini düzenleme
- GIF yolunu değiştirme
- Fallback GIF yolunu değiştirme
- İstersem yeni rest step ekleyebilme
- İstersem mevcut egzersizi duplicate edebilme
- Değişiklikleri kaydedebilme
- Kaydedilen plan localStorage’da saklansın
- “Default plana dön” butonu olsun

Not:
Bu editör profesyonel admin panel gibi olmak zorunda değil.
Basit, temiz, kullanışlı ve hızlı çalışan bir düzenleme ekranı yeterli.

Workout Player akışı:
Açılış ekranı:
- Plan adı
- Kısa açıklama
- Büyük “Start” butonu
- “Planı Düzenle” butonu

Start’a basınca workout başlasın.

Egzersiz ekranında:
- Büyük hareket adı
- Büyük GIF alanı
- Ortada belirgin geri sayım
- Üstte progress bar
- Step bilgisi (ör. 3 / 22)
- Faz bilgisi (warmup / main / cooldown)
- Tur bilgisi gerekiyorsa göster
- Alt köşede sıradaki hareket kartı:
  - küçük GIF
  - hareket adı
  - “Sıradaki” etiketi

Dinlenme ekranında:
- “Dinlen” başlığı
- geri sayım
- sıradaki hareketin adı
- küçük GIF önizlemesi
- egzersiz ekranından görsel olarak farklı olsun

Workout bitince:
- “Good job! Workout completed.”
- Restart butonu
- Ana ekrana dön butonu

Kontroller:
- pause/resume
- previous
- next
- quit

Davranış:
- Sayaç otomatik aksın
- Süre bitince otomatik sonraki adıma geçsin
- Son 3 saniyede görsel vurgu olsun
- İsteğe bağlı kısa bip sesi aç/kapat seçeneği olsun
- Hafif, akıcı animasyonlar kullan
- Framer Motion kullanılabilir

Default plan:
Bu plan uygulamada başlangıçta hazır gelsin.

Warmup:
- 30 sn Yerinde hafif yürüyüş / diz çekme
- 30 sn Kol çevirme
- 30 sn Cat-Cow
- 30 sn Squat to Reach
- 30 sn Glute Bridge
- 30 sn Half Jumping Jack

Main:
2 tur
Her hareket 40 sn
Her hareket arasında 20 sn dinlenme
- Jumping Jack
- Push-up
- Bodyweight Squat
- Mountain Climber
- Glute Bridge
- Forearm Plank

Cooldown:
- 30 sn Child’s Pose
- 30 sn Cobra Stretch
- 30 sn Hamstring Stretch
- 30 sn Deep Breathing

Veri modeli:
Her adım için şu alanları destekle:
- id
- type ("exercise" | "rest")
- name
- duration
- gif
- phase ("warmup" | "main" | "cooldown" | "rest")
- round
- source
- fallbackGif

Plan yapısı:
- Default plan ayrı bir config dosyasında dursun
- Aktif plan editable olsun
- İlk yüklemede default plan kopyalanıp aktif plan olarak kullanılsın
- Kullanıcının yaptığı değişiklikler localStorage’a yazılsın
- İstenirse tek tıkla default plan geri yüklenebilsin

Asset/GIF stratejisi:
1. Uygulama, hareket GIF’lerini bir mapping/config sistemi üzerinden yönetsin
2. Önce belirli egzersizler için harici egzersiz veritabanlarından eşleşme yapılabilsin
3. Ana hedef kaynaklar:
   - wger
   - ExerciseDB
4. Ancak uygulama bu harici kaynaklara bağımlı olmasın
5. Eğer uygun eşleşme bulunamazsa lokal fallback GIF yolu kullanılsın
6. Özellikle warmup ve cooldown hareketlerinde fallback yapısı güçlü olsun
7. Ana egzersizlerde mümkünse DB eşleşmesi dene:
   - Jumping Jack
   - Push-up
   - Bodyweight Squat
   - Mountain Climber
   - Glute Bridge
   - Forearm Plank

Claude Code’dan istediğim:
- Bu hareketler için uygun eşleşmeleri bulmaya çalış
- Bulduğu eşleşmeleri net bir mapping tablosunda göster
- Emin olmadığı eşleşmeleri açıkça işaretle
- Eşleşme bulunmayanlar için lokal placeholder/fallback kullan
- Projeyi, harici medya hiç gelmese bile çalışır halde kur
- Plan editörü ile player aynı projede düzgün çalışsın
- Hareket ve süre düzenleme mantığı sağlam olsun

İstenen çıktı:
- Çalışan MVP
- Temiz arayüz
- Default plan hazır yüklü
- Plan editörü çalışıyor
- Hareket ekleme/silme/sıralama/süre değiştirme çalışıyor
- Workout akışı sorunsuz
- Next exercise preview düzgün çalışıyor
- Local fallback sistemi hazır
- localStorage ile plan persist ediliyor
- Kod içinde kısa açıklamalar var

Dosya yapısı önerisi:
- data/defaultWorkoutPlan.ts
- data/exerciseMediaMap.ts
- lib/storage.ts
- public/exercises/... (fallback gifler)
- components/WorkoutPlayer.tsx
- components/ExerciseScreen.tsx
- components/RestScreen.tsx
- components/FinishScreen.tsx
- components/PlanEditor.tsx
- app/page.tsx veya eşdeğer giriş noktası

Ek not:
Bu proje tek kullanıcı için. O yüzden çözüm pratik, sağlam ve hızlı olmalı. Gereksiz backend veya veritabanı kurma. Gerekirse tüm mapping statik config dosyalarında dursun.

Tasarım hedefi:
Kaba bir dashboard değil; gerçek bir workout player gibi hissettirsin.
Öncelik sırası:
1. Akışın sorunsuz çalışması
2. Plan düzenleme kolaylığı
3. Sayaç ve step yönetimi
4. Next exercise preview
5. Temiz modern görünüm