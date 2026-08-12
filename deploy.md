# Deploy Guide — CX53 / Coolify · Yeni Proje Başlangıcı

  

Yeni bir projeyi sıfırdan CX53'e almak için tek referans. Sırayla izlenir.

  

Bu doküman bir kurulum rehberinden fazlası: **2026 boyunca bu sunucuda bulduğumuz her güvenlik

açığının tekrar etmemesi için gereken adımlar sıraya gömülüdür.** Adımları atlarsan aynı

açıkları yeniden üretirsin — hangisini niye yaptığımız her adımın altında yazıyor.

  

> **Sır kuralı:** Bu dosyaya ve projenin hiçbir dosyasına (log.md, CLAUDE.md, README) düz

> token/parola YAZILMAZ. Sırlar Bitwarden'da, çalışma anında `bw get` ile çözülür.

  

---

  

## 0. Başlamadan — 8 kural

  

Bunlar tavsiye değil; her biri bu sunucuda gerçekten yaşanmış bir olayın karşılığı.

  

| # | Kural | Neyin tekrarını önlüyor |

|---|---|---|

| 1 | Her env değişkeni **`"is_buildtime": false`** ile yazılır | Coolify varsayılanı `true` → sırlar `--build-arg` olarak imaj katmanlarına düz metin yazılıyor. 2026-08-07'de **63 uygulamada** bulundu |

| 2 | `NEXT_PUBLIC_*` / `VITE_*` içine **asla sır konmaz** | Bunlar zaten tarayıcı bundle'ında. `VITE_STRAPI_TOKEN` gibi örnekler bulundu — build-arg'ı kapatmak bunları kurtarmaz |

| 3 | Veritabanı **public port açılmaz** | `eu-onarim-enerjisi` DB'si 5432'den internete açıktı; 20 gün boyunca **30.737 parola denemesi** yedi. İhlal olmadı, şans eseri |

| 4 | Her projeye **kendi DB + kendi kullanıcısı** | `postgres` superuser'ı app'in `DATABASE_URL`'inde asla olmaz |

| 5 | `.env` **git'e girmez**, sırlar Bitwarden'da | 2026-06'da 45 dosyaya yayılmış token temizliği yapıldı |

| 6 | Deploy sonrası **yedek kapsamı doğrulanır** | 2026-07-10'da yedek script'i 23 DB'yi sessizce atlıyordu, log yine "OK" yazıyordu |

| 7 | İmaj boyutu **ölçülür** | `aday-worker` tek başına 31 GB'dı; %71'i CX53'te GPU olmadığı hâlde inen CUDA'ydı |

| 8 | Kimlik doğrulama hatasında **404 dön, 401 değil** | 401 "burada korunan bir şey var" bilgisini verir |

  

---

  

## 1. Sunucu & Erişim

  

| | Değer |

|---|---|

| **Sunucu** | CX53 (x86, 16 vCPU / 32 GB RAM / 320 GB disk), Hetzner **Nuremberg (nbg1)** |

| **IP** | `167.233.159.42` |

| **OS** | Ubuntu 26.04 LTS |

| **SSH** | `ssh -i ~/.ssh/id_ed25519 root@167.233.159.42` — **publickey only**, `id_rsa` çalışmaz |

| **Coolify** | v4.1.2 · **`https://coolify.rhinorunner.net`** (TLS, tünel gerekmez) |

| **Coolify API token** | Bitwarden: `cx53-claude-migration` |

| **server uuid** | `gl596l61nn16v24mzqsi2v0e` |

| **GitHub App** | `coolify-nbg` — uuid `d12n4gdxfywvpgn09v2tyq5x` |

| **Runtime IDS** | Falco (modern eBPF) **aktif** |

  

```bash

export BW_SESSION=$(bw unlock --raw)

T=$(bw get password cx53-claude-migration)

B=https://coolify.rhinorunner.net/api/v1

  

curl -s -H "Authorization: Bearer $T" $B/version # 4.1.2 dönmeli

```

  

> **Port 8000 artık kullanılmıyor.** Dışarıdan erişilemiyor (`DOCKER-USER` DROP + allowlist).

> Eskiden gereken `ssh -L 8003:localhost:8000` tüneli **artık gerekmiyor** — TLS endpoint var.

  

> **Tek sunucu var.** Eski `65.109.141.55` (CAX31) ve `95.216.191.135` sunucuları konsolide

> edildi; yeni proje kurulumunda hiçbirine ihtiyaç yok. 65'te yalnızca smurfssubsea statik

> sitesi kaldı ve o da kapatılma sırasında.

  

---

  

## 2. Ön hazırlık — repo ve sırlar

  

```bash

# 1) Repo (private — istisnası yok, içerik açık olsa bile config/env geçmişi sızmasın)

gh repo create ahmetgon/MYREPO --private --source=. --remote=origin --push

  

# 2) .env asla commit'lenmez

grep -qxF '.env' .gitignore || echo '.env' >> .gitignore

  

# 3) Sırlar Bitwarden'a — repoya değil

# Login item aç, notlarına hangi app'te hangi env key'i olduğunu yaz.

```

  

GitHub App yeni repoyu görmüyorsa Coolify klonlayamaz (`coolify-nbg` ayarlarından repo erişimi

verilir). Belirti: deploy "repository not found" ile düşer.

  

### 2.1 Dokümantasyon iskelesi — projeyi Beyin'e bağla

  

Yeni proje **ilk günden** ortak bilgi tabanına (`~/Obsidian/Ahmetgo/Beyin/`) bağlanır. Böylece

altı ay sonra "bu projede neyi neden böyle yapmıştık" sorusunun cevabı duruyor olur ve

`https://beyin.ahmetgo.com` paketine otomatik girer.

  

**Ne zaman ve nasıl not yazılacağı zaten global:** `~/.claude/CLAUDE.md` her oturumda yüklenir,

`/kayit` skill'i formatı taşır. **Konvansiyonu proje dosyalarına kopyalama** — eskiyen kopyalar

çelişiyordu, 2026-08-07'de 8 dosyadan temizlendi. Projede sadece işaretçi ve künye olur.

  

**a) `CLAUDE.md`** — proje köküne:

  

```markdown

## Deploy & Secrets

Deploy için `deploy.md`'yi izle. Tüm sırlar Bitwarden'da (`bw get …`).

Repoya, log'a veya dokümana düz token/parola YAZMA.

Coolify'a env eklerken `is_buildtime: false` zorunlu.

  

## Kayıt

Çalışma günlüğü `log.md` (yeni girdi en üste). Kalıcı notlar ortak bilgi tabanında:

`~/Obsidian/Ahmetgo/Beyin/<proje-slug>/`. Ne zaman/nasıl yazılacağı `~/.claude/CLAUDE.md`

ve `/kayit` skill'inde — buraya kopyalama.

```

  

**b) `log.md`** — proje köküne, künye doldurularak. Künye deploy sırasında öğrendiğin

değerlerle dolar; boş bırakma, altı ay sonra bunları aramak zaman kaybı:

  

```markdown

# <proje> — Çalışma Günlüğü

  

> Her oturumda güncellenir. Yeni girdiler **en üste** (ters kronolojik):

> tarih, bağlam, kök sebep, yapılanlar, kararlar, açık kalanlar.

> **Sır YAZMA** — "Bitwarden'da `<isim>`" yaz.

  

## Proje Künyesi

- **Repo:** `git@github.com:ahmetgon/<repo>.git`

- **Production:** `https://<proje>.ahmetgo.com` · **Staging:** `https://test.<proje>.ahmetgo.com`

- **Coolify:** proje `<proj-uuid>` · app `<app-uuid>`

- **DB:** `<proje>` · kullanıcı `<proje>_user` (parola Bitwarden'da)

- **Framework / Node:** `<…>` · **Branch akışı:** `develop` → staging, `main` → production

  

---

```

  

`log.md` git'e girer (sır içermediği için). `.env` girmez.

  

**c) Proje slug'ı** — Beyin klasör adı, `log.md` ve Coolify app adıyla tutarlı olsun

(`~/dev/<x>/<proje>` → `<proje>`). Tutarsız slug, notların iki ayrı klasöre dağılmasına yol açar.

  

---

  

## 3. Proje + uygulama oluştur

  

```bash

proj=$(curl -s -X POST -H "Authorization: Bearer $T" -H "Content-Type: application/json" \

-d '{"name":"MYAPP"}' $B/projects | jq -r .uuid)

  

au=$(curl -s -X POST -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d "{

\"project_uuid\":\"$proj\",

\"server_uuid\":\"gl596l61nn16v24mzqsi2v0e\",

\"environment_name\":\"production\",

\"github_app_uuid\":\"d12n4gdxfywvpgn09v2tyq5x\",

\"git_repository\":\"ahmetgon/MYREPO\",

\"git_branch\":\"main\",

\"build_pack\":\"dockerfile\",

\"ports_exposes\":\"3000\",

\"name\":\"MYAPP-production\",

\"instant_deploy\":false

}" $B/applications/private-github-app | jq -r .uuid)

  

echo "app uuid: $au"

```

  

- `instant_deploy` **daima `false`** — `true` API'yi bloke ediyor. Deploy'u 7. adımda ayrı çağır.

- `build_pack`: **`dockerfile` tercih edilir** (ne kurulduğunu sen kontrol edersin, imaj boyutu

ölçülebilir). `nixpacks` da çalışır ama NODE_ENV tuzağı ve "app type" tespit hataları onda.

Compose gerekiyorsa `dockercompose`.

- Monorepo / özel Dockerfile ise:

  

```bash

curl -s -X PATCH -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{

"base_directory":"/app",

"dockerfile_location":"/Dockerfile.web"

}' $B/applications/$au

```

  

---

  

## 4. Env değişkenleri — **en kritik adım**

  

Coolify'da `is_buildtime` varsayılanı **`true`**'dur. Açıkça `false` vermezsen değer

`--build-arg` olarak geçer ve BuildKit onu **imaj katman geçmişine düz metin** yazar; sunucudaki

herkes `docker history` ile okuyabilir. Bu, 2026-08-07'de 63 uygulamada bulunan sızıntının

tam sebebidir. **Hem `dockerfile` hem `nixpacks` etkilenir.**

  

```bash

# Doğru kullanım — HER SIR İÇİN

curl -s -X POST -H "Authorization: Bearer $T" -H "Content-Type: application/json" \

-d "{\"key\":\"API_KEY\",\"value\":\"$(bw get password myapp-api-key)\",

\"is_preview\":false,\"is_buildtime\":false,\"is_literal\":true}" \

$B/applications/$au/envs

```

  

- Alan adı **`is_buildtime`**. `is_build_time` / `build_time` API tarafından reddedilir

("This field is not allowed") — yanlış yazarsan sessizce değil, hatayla döner; iyi haber.

- Bir POST **iki satır** yaratır (production + preview kopyası). Normaldir; ikisi de `false` olur.

  

**Build-time gerçekten gereken değişkenler** (`NEXT_PUBLIC_*`, `VITE_*_URL`) için `is_buildtime`

`true` kalmalı — ama o zaman kural 2 devreye girer: **bunlar herkese açıktır.** Tarayıcıya inen

bundle'da yer alırlar. Oraya API anahtarı, token, parola koyma. Koyman gerekiyorsa o anahtar

salt-okunur ve dar kapsamlı olmalı.

  

**Doğrula (deploy sonrası, 9. adımda tekrar):**

  

```bash

ssh -i ~/.ssh/id_ed25519 root@167.233.159.42 \

"docker history --no-trunc \$(docker inspect <container> --format '{{.Image}}') \

| grep -iE 'API_KEY=|SECRET=|TOKEN=|PASSWORD=' | head"

# Boş çıkmalı. Çıkmıyorsa: env'i düzelt, YENİDEN BUILD et (katman geçmişi eski imajda kalır),

# ve sızan anahtarı ROTASYONA SOK — imajı silmek sızıntıyı geri almaz.

```

  

---

  

## 5. Veritabanı

  

```bash

pgr=$(curl -s -X POST -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d "{

\"server_uuid\":\"gl596l61nn16v24mzqsi2v0e\",\"project_uuid\":\"$proj\",

\"environment_name\":\"production\",\"name\":\"MYAPP-db\",

\"postgres_user\":\"myapp_user\",\"postgres_db\":\"myapp\",

\"image\":\"postgres:16-alpine\",\"instant_deploy\":true

}" $B/databases/postgresql)

  

dburl=$(echo "$pgr" | jq -r .internal_db_url) # app bunu kullanır

```

  

**`internal_db_url` kullan — public port AÇMA.** App ile DB aynı Docker ağındadır, dışarıdan

erişime ihtiyaç yoktur. Coolify UI'daki "Make it publicly available" anahtarına dokunma.

2026-07'de tek bir projede bu açık kaldı diye DB 20 gün boyunca credential-list saldırısı yedi

(30.737 deneme, 4.321 farklı kullanıcı adı). Yönetim gerekiyorsa SSH tüneli kullan:

  

```bash

ssh -i ~/.ssh/id_ed25519 -fNL 5433:localhost:5432 root@167.233.159.42 # geçici, işi bitince kapat

```

  

**En az yetki** — Coolify'ın oluşturduğu kullanıcı DB sahibidir; başka projeye erişemediğini

teyit et. Aynı DB'ye ikinci bir uygulama bağlanacaksa ayrı kullanıcı aç:

  

```sql

REVOKE CONNECT ON DATABASE myapp FROM PUBLIC;

-- ikinci uygulama için ayrı, dar yetkili kullanıcı — superuser paylaşma

```

  

`DATABASE_URL`'i app'e yaz (yine `is_buildtime:false`):

  

```bash

curl -s -X POST -H "Authorization: Bearer $T" -H "Content-Type: application/json" \

-d "{\"key\":\"DATABASE_URL\",\"value\":\"$dburl\",\"is_preview\":false,\"is_buildtime\":false}" \

$B/applications/$au/envs

```

  

---

  

## 6. Persistent storage (gerekiyorsa)

  

```bash

curl -s -X POST -H "Authorization: Bearer $T" -H "Content-Type: application/json" \

-d '{"name":"MYAPP-data","mount_path":"/app/data","type":"persistent"}' \

$B/applications/$au/storages

```

  

`type` **mutlaka `"persistent"`** (`volume` / `bind` reddedilir). Oluşan volume adı:

`<app-uuid>-MYAPP-data`. Volume yedeği `backup-files.sh` tarafından otomatik alınır

(2026-07-03'ten beri `docker volume ls -q` ile hepsi) — 9. adımda doğrulayacaksın.

  

---

  

## 7. Deploy + doğrulama

  

```bash

curl -s -X POST -H "Authorization: Bearer $T" "$B/deploy?uuid=$au"

  

# durum

ssh -i ~/.ssh/id_ed25519 root@167.233.159.42 'docker exec $(docker ps --format "{{.Names}}"|grep coolify-db|head -1) \

psql -U coolify -d coolify -tA -F"|" -c "SELECT status,created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 1;"'

```

  

Domain vermediysen Coolify otomatik `<uuid>.167.233.159.42.sslip.io` test domain'i verir →

`curl -k https://<sslip>/` ile DNS'e dokunmadan doğrula.

  

**İmaj boyutunu ölç** (kural 7):

  

```bash

ssh -i ~/.ssh/id_ed25519 root@167.233.159.42 "docker images --format '{{.Repository}} {{.Size}}' | grep $au"

```

  

Beklediğinden büyükse **sebebini bul, tahmin etme**. `aday-worker` 15.7 GB'dı; ölçünce %71'inin

`torch`'un GPU build'i olduğu çıktı (CX53'te GPU yok). Python'da `--extra-index-url .../whl/cpu`

+ `torch==…+cpu` ile 0.92 GB'a indi. Disk şu an **%75** — her GB gerçek.

  

---

  

## 8. Domain + DNS + sertifika

  

```bash

# 1) app'e domain ekle

curl -s -X PATCH -H "Authorization: Bearer $T" -H "Content-Type: application/json" \

-d '{"domains":"https://app.ahmetgo.com"}' $B/applications/$au

  

# 2) Traefik label'ları için restart (rebuild DEĞİL)

curl -s -X POST -H "Authorization: Bearer $T" $B/applications/$au/restart

  

# 3) DNS — Cloudflare panelinden ELLE:

# Tür A · İsim <app> · İçerik 167.233.159.42 · Proxy KAPALI (DNS only) · TTL 60

# Proxy'yi açma: turuncu bulut açıkken Let's Encrypt HTTP-01 doğrulaması Traefik'e ulaşamaz,

# sertifika hiç gelmez. Cert oturduktan sonra istersen açabilirsin.

  

# 4) sertifika gelmezse ACME'yi tetikle

ssh -i ~/.ssh/id_ed25519 root@167.233.159.42 'docker restart coolify-proxy'

  

# 5) doğrula

curl -s -o /dev/null -w '%{http_code} cert=v%{ssl_verify_result}\n' https://app.ahmetgo.com/

# cert=v0 → geçerli. API kökü 404 verebilir, normal.

```

  

> DNS **elle** yapılıyor; deploy akışının Cloudflare API token'ına ihtiyacı yok (sunucuda ve

> Coolify env'lerinde bunu kullanan hiçbir şey yok — doğrulandı 2026-08-07).

> `*.ahmetgo.com` wildcard'ı hâlâ eski sunucuya bakıyor olabilir; **explicit A kaydı onu ezer**,

> o yüzden her app için açık A kaydı aç.

> `rhinorunner.com` ve müşteri domainleri **farklı Cloudflare hesabında**.

> **Traefik ACME'yi kendiliğinden yeniden denemez** — DNS'i sonradan düzelttiysen proxy'yi restart et.

> Alan adı çözülmüyorsa önce **kayıt şirketinde askıya alınmış mı** bak (Natro'da yaşandı):

> belirti, DNS'in doğru görünüp sitenin hiç açılmamasıdır.

  

---

  

## 9. Yayına aldıktan sonra — zorunlu güvenlik doğrulaması

  

Bunlar "sonra bakarız" listesi değil; her biri daha önce atlandığı için sorun çıkardı.

  

```bash

S="ssh -i ~/.ssh/id_ed25519 root@167.233.159.42"

  

# 1) Sır imaj katmanlarında mı? (kural 1) — BOŞ ÇIKMALI

$S "docker history --no-trunc \$(docker inspect <container> --format '{{.Image}}') \

| grep -iE 'KEY=|SECRET=|TOKEN=|PASSWORD=' | head"

  

# 2) DB dışarı açık mı? (kural 3) — 0 ÇIKMALI

$S 'docker exec $(docker ps --format "{{.Names}}"|grep coolify-db|head -1) \

psql -U coolify -d coolify -tA -c "SELECT count(*) FROM standalone_postgresqls WHERE is_public=true;"'

$S 'ss -tlnp | grep -E ":5432|:3306|:6379"' # boş çıkmalı

  

# 3) Beklenmedik açık port var mı?

$S 'ss -tlnp | grep "0.0.0.0"'

# Meşru olanlar: 22, 80, 443, 6001/6002 (coolify-realtime). Başka bir şey → araştır.

  

# 4) Yedek kapsamına girdi mi? (kural 6) — ERTESİ GÜN kontrol et

$S 'tail -3 /data/backups/logs/cron.log; ls /data/backups/db/$(date +%F)/ | grep -i myapp'

$S 'docker volume ls -q | grep <app-uuid>' # volume varsa backup-files.sh alır

  

# 5) Falco yeni uygulamada alarm veriyor mu?

$S 'journalctl -u falco-modern-bpf --since "1 hour ago" | grep -i warning | tail'

```

  

**Yedek doğrulaması neden zorunlu:** `backup-db.sh` DB'leri `docker ps` ile otomatik keşfeder,

yani yeni proje **normalde** kapsama girer. Ama 2026-07-10'da keşif mantığı 23 canlı DB'yi

sessizce atladı ve log yine `OK=31 FAIL=0` yazdı. **Log'un "OK" demesi yedeğin alındığı anlamına

gelmez — dosyanın varlığını ve boyutunu gör.** Bugünkü sağlıklı durum: `OK=81 FAIL=0`, 327 MB.

  

---

  

## 10. Proje kaydı — kickoff notunu yaz

  

Deploy bitti, doğrulamalar temiz. **Kapatmadan önce** kaydı yaz; yoksa bu oturumun bilgisi

(neden bu stack, hangi alternatif elendi, hangi tuzağa takıldın) kaybolur.

  

1. **`log.md` künyesini doldur** — az önce öğrendiğin gerçek değerlerle: app uuid, domain,

DB adı, build pack. Boş placeholder bırakma.

2. **`/kayit`** çalıştır → `~/Obsidian/Ahmetgo/Beyin/<proje>/<tarih>-kickoff-ve-ilk-deploy.md`.

Kickoff notunda en az şunlar olmalı:

- **Proje ne, kim için** — bir paragraf, teknik olmayan biri de anlasın.

- **Stack kararı ve gerekçesi** — özellikle **elenen alternatif** ve neden elendiği.

- **Deploy'da takıldıkların** — çözümüyle. Bir sonraki proje aynı duvara toslamasın.

- **Açık kalanlar** — staging kurulmadı, monitoring yok, X env'i geçici, vb.

3. Frontmatter'da `gizlilik: ic` (varsayılan). Müşteri adı/ticari detay hassassa `sir` yap —

`sir` hiçbir yayın paketine girmez.

4. Başka projede benzer iş yaptıysak `ilgili:` alanına ekle. Sistemin değeri burada:

`grep -rl "<konu>" ~/Obsidian/Ahmetgo/Beyin/`

  

> Oturum sonunda not yazılmadıysa hook (`~/.claude/bin/beyin.py`) bunu **borç** olarak kaydeder

> ve bir sonraki oturumun başında hatırlatır — `python3 ~/.claude/bin/beyin.py --borc` ile de

> görebilirsin. Yani unutulursa kaybolmaz, ama borç birikir.

  

**Yeni proje ilk kez `Beyin/` altına yazınca** paket listesine girsin diye:

  

```bash

cd ~/dev/beyin/beyin && ./yayinla.sh # derle + güvenlik kapısı (yayınlamaz)

./yayinla.sh --gonder # kapı temizse canlıya

```

  

Kapı kırmızı yanarsa **yayınlama** — çıktıdaki her şüpheli dizeye tek tek karar ver. Gerçek

sırsa kaynaktan sil **ve rotate et**; zararsızsa `izin-listesi.txt`'e ekle.

  

---

  

## 11. Tuzaklar (yaşanmış)

  

| Belirti | Sebep / Çözüm |

|---|---|

| Sırlar `docker history`'de görünüyor | `is_buildtime` açıkça `false` verilmemiş (varsayılan `true`). Düzelt + **yeniden build** + anahtarı rotate et |

| `is_build_time` API'de reddediliyor | Doğru alan adı **`is_buildtime`** |

| Env iki kez görünüyor | Coolify her env için production + preview çifti yaratır. Normal |

| `instant_deploy:true` ile API takılır | `false` kullan, sonra ayrı `/deploy` çağır |

| Build: `sh: tsc: not found` (exit 127) | Coolify env'ine **`NODE_ENV=production` EKLEME** — build'de dev-deps atlanır. Dockerfile kendi NODE_ENV'ini set etsin |

| Build: nixpacks "failed to detect app type" / "Dockerfile not found" | `base_directory` / `dockerfile_location` verilmemiş |

| Build `nix-env`'de exit 255 | Paralel build'de geçici → sadece **redeploy** |

| HTTPS 000 / TRAEFIK DEFAULT CERT | ACME tetiklenmedi → `docker restart coolify-proxy` (cert 1-2 dk sonra; o sırada 000 normal). **Traefik kendiliğinden yeniden denemez** |

| `curl -k` ile "çalışıyor" görünüp tarayıcıda hata | `-k` sertifika doğrulamasını kapatır — **yanıltır**. `%{ssl_verify_result}` ile bak |

| storage `type` reddedildi | `type:"persistent"` (volume/bind değil) |

| Coolify env list API'si değer döndürmez | Gerçek değer için `docker exec <c> env` |

| `pre_deployment_command` yeni dosyayı görmüyor | Komut **ESKİ container'da** koşar. Migration gibi yeni-kodla gelen işleri container **CMD/entrypoint**'ine al |

| `docker restart` env değişikliğini almadı | Coolify'da env değişince **redeploy** gerekir, restart yetmez |

| Proje notları iki ayrı `Beyin/` klasörüne dağıldı | Proje slug'ı tutarsız (`~/dev/x/proje` klasör adı esas alınır). Klasörleri birleştir, `log.md` künyesindeki adı da hizala |

| Yeni proje `beyin.ahmetgo.com` paketinde yok | Not yazıldı ama yayınlanmadı → `cd ~/dev/beyin/beyin && ./yayinla.sh --gonder` |

| Oturum bitti, not yazılmadı | Hook borç kaydı tutar: `python3 ~/.claude/bin/beyin.py --borc`. Arşivdeki transkriptten sonradan yazılabilir |

| Disk hızla doluyor | `docker-temizle.sh` (cron 05:00) 48 saatlik imajları ve staging'de son 2 dışındakileri siler. İmajlar `/var/lib/containerd`'de **çift** saklanır — `du /var/lib/docker`'a bakıp "sorun yok" deme |

  

---

  

## 12. Faydalı komutlar

  

```bash

# app listesi

curl -s -H "Authorization: Bearer $T" $B/applications | jq -r '.[]|.name+" "+.uuid'

  

# app logu / disk / konteyner sağlığı

S="ssh -i ~/.ssh/id_ed25519 root@167.233.159.42"

$S 'docker logs --tail 40 $(docker ps -q -f name=<uuid>)'

$S 'df -h /; docker system df'

$S 'docker ps --filter health=unhealthy --format "{{.Names}} {{.Status}}"'

  

# env'lerin build-time durumu (tüm sunucu)

$S 'docker exec $(docker ps --format "{{.Names}}"|grep coolify-db|head -1) \

psql -U coolify -d coolify -tA -F"|" -c "SELECT is_buildtime,count(*) FROM environment_variables GROUP BY 1;"'

```

  

---

  

## 13. Bilinen teknik borç (yeni projeyi etkilemez, ama bilmen gerek)

  

- **`is_buildtime=true` 1223 satır** — mevcut uygulamaların çoğu hâlâ sızıntılı. Yeni proje bu

listeye eklenmesin diye 4. adım var. Tam çalışma listesi: `build-arg-sizinti-20260807.md`.

- **Dışa açık port 3000** (usesend) — Traefik/TLS baypas ediyor, kapatılmayı bekliyor.

- **Disk %75** — yeni projede imaj boyutuna dikkat.

- **GitHub repo mirror pasif** — `/root/.gh-backup-token`'a read-only PAT konulmadığı için

yedekte secrets var, repo mirror yok.

  

> Oturum geçmişi ve karar kayıtları: `log.md`. Sunucu güvenlik duruşu: `guvenlik-durusu.md`.