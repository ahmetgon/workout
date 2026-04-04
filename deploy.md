# GitHub > Coolify Deployment Guide

> Bu dosyayi yeni projenin kok dizinine kopyala.
> Claude Code / AI agent bu dosyayi okuyarak projeyi sifirdan Coolify'a deploy edebilir.
> RhinoRunner projesinde yasanan tum sorunlar ve cozumleri dahil edilmistir.

---

## SUNUCU & ERISIM BILGILERI

| Alan | Deger |
|------|-------|
| Sunucu IP | 95.216.191.135 |
| SSH | `sshpass -p 'gReLFcsLbUE3' ssh -o StrictHostKeyChecking=no root@95.216.191.135` |
| Coolify Dashboard | http://95.216.191.135:8000 |
| Coolify API Base | http://95.216.191.135:8000/api/v1 |
| Coolify API Token | I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3 |
| Server UUID | xhqd61ecwp6n3k9068zqo6i6 |
| Traefik Proxy | Port 80/443, Let's Encrypt aktif |
| GitHub Hesabi | ahmetgon (gh CLI authenticated) |

---

## SSH DEPLOY KEY (PRIVATE REPO DESTEGI)

Tum repolar private. Her yeni proje icin bu key kullanilmali.

| Alan | Deger |
|------|-------|
| Coolify Key ID | 1 |
| Coolify Key UUID | sq0qauni0lyegib6wik6lrqf |
| Public Key | `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDklUYvM+Z4ifOiNdvuMYIkR+5mGfA01f19ktPCKlSWd coolify-deploy@ahmetgo.com` |

### Her Yeni Repo Icin Deploy Key Ekleme

```bash
gh api repos/{owner}/{repo}/keys \
  --input - <<'EOF'
{
  "title": "Coolify Deploy Key",
  "key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDklUYvM+Z4ifOiNdvuMYIkR+5mGfA01f19ktPCKlSWd coolify-deploy@ahmetgo.com",
  "read_only": true
}
EOF
```

> Deploy key eklenmeden Coolify private repo'yu cekemez!

---

## DOMAIN STRATEJISI

Cloudflare'de wildcard A kaydi mevcut:

```
*.ahmetgo.com -> 95.216.191.135 (Proxy OFF / DNS only)
```

Her proje subdomain bazli:

```
<proje>.ahmetgo.com          -> production
test.<proje>.ahmetgo.com     -> staging
```

> **KRITIK:** Cloudflare proxy KAPALI olmali (gri bulut). SSL'i Coolify/Traefik (Let's Encrypt) veriyor. Proxy acik olursa SSL cakismasi yasanir.
>
> Yeni proje eklerken DNS'e dokunmaya gerek yok -- wildcard tum subdomain'leri karsiliyor.

---

## GIT BRANCHING STRATEJISI

```
main      -> production deploy (canli site)
develop   -> staging deploy (test sitesi)
```

### Gunluk Calisma Akisi

1. `develop` branch'te calis, commit & push et
2. Push -> GitHub Actions -> Coolify API -> staging'e otomatik deploy
3. Staging'de test et
4. GitHub'da PR ac: `develop` -> `main`, merge et
5. Merge -> GitHub Actions -> Coolify API -> production'a otomatik deploy

> **KURAL:** Asla dogrudan `main`'e push yapma. Her zaman `develop`'a push, test et, sonra merge.

---

## COOLIFY PROJE YAPISI

```
Coolify Project: <proje-adi>
+-- Environment: production
|   +-- Branch: main
|   +-- Domain: https://<proje>.ahmetgo.com
|   +-- Auto deploy: GitHub Actions
+-- Environment: staging
    +-- Branch: develop
    +-- Domain: https://test.<proje>.ahmetgo.com
    +-- Auto deploy: GitHub Actions
```

---

## DEPLOY KURULUM ADIMLARI

### Adim 0: Proje Hazirligini Yap (Build Uyumlulugu)

Node.js projeleri icin deploy oncesi:

1. `.node-version` dosyasi olustur:
```bash
echo "20" > .node-version
```

2. `package.json`'a `engines` ekle:
```json
"engines": {
  "node": ">=20.0.0"
}
```

3. Commit & push et.

> **NEDEN:** Nixpacks `.node-version` veya `engines` olmadan eski Node kullanabilir. `npm ci` komutu lockfileVersion 3 ile uyumsuz olabiliyor.

#### Vite Projesi Icin Ek Ayarlar

Vite development server'i varsayilan olarak sadece `localhost`'u dinler. Coolify container icinde disaridan erisilemez. `package.json` preview/start komutunu ayarla:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  }
}
```

Veya `vite.config.ts`'de:
```typescript
export default defineConfig({
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0', port: 4173 }
})
```

> **Static site olarak deploy edeceksen** (onerilen): Vite `build` komutu `dist/` klasorune statik dosyalar uretir. Coolify'da `Static` build pack kullanabilirsin veya Nixpacks ile basit bir Nginx/serve yapisi kurabilirsin.

**Nixpacks ile statik serve icin `package.json`:**
```json
{
  "scripts": {
    "build": "vite build",
    "start": "npx serve dist -s -l 3000"
  }
}
```

`serve` dependency olarak ekle:
```bash
npm install -D serve
```

---

### Adim 1: GitHub Repo Hazirligi

```bash
# 1a. Deploy key ekle (private repo icin zorunlu)
gh api repos/{owner}/{repo}/keys \
  --input - <<'EOF'
{
  "title": "Coolify Deploy Key",
  "key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDklUYvM+Z4ifOiNdvuMYIkR+5mGfA01f19ktPCKlSWd coolify-deploy@ahmetgo.com",
  "read_only": true
}
EOF

# 1b. develop branch olustur (yoksa)
gh api repos/{owner}/{repo}/git/refs \
  -f ref="refs/heads/develop" \
  -f sha="$(gh api repos/{owner}/{repo}/git/ref/heads/main -q '.object.sha')"
```

---

### Adim 2: Coolify'da Proje Olustur

```bash
curl -s http://95.216.191.135:8000/api/v1/projects \
  -H "Authorization: Bearer I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3" \
  -H "Content-Type: application/json" \
  -d '{"name":"<proje-adi>","description":"<aciklama>"}'
```

> Donen UUID'yi kaydet -- sonraki adimlarda kullanilacak.

---

### Adim 3: Staging Environment Olustur

```bash
curl -s http://95.216.191.135:8000/api/v1/projects/<project-uuid>/environments \
  -H "Authorization: Bearer I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3" \
  -H "Content-Type: application/json" \
  -d '{"name":"staging"}'
```

> `production` environment varsayilan olarak zaten var.

---

### Adim 4: Uygulama Olustur (Her Environment Icin)

> **KRITIK:** `git_repository` alanina sadece `owner/repo` formatinda yaz.
> Coolify `https://github.com/` prefix'ini otomatik ekler.
> Tam URL yazarsan `https://github.com/https://github.com/...` gibi cift URL hatasi alirsin.

```bash
# Production
curl -s -X POST "http://95.216.191.135:8000/api/v1/applications/public" \
  -H "Authorization: Bearer I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "<project-uuid>",
    "environment_name": "production",
    "server_uuid": "xhqd61ecwp6n3k9068zqo6i6",
    "git_repository": "{owner}/{repo}",
    "git_branch": "main",
    "build_pack": "nixpacks",
    "name": "<proje>-production",
    "domains": "https://<proje>.ahmetgo.com",
    "ports_exposes": "3000",
    "install_command": "npm install"
  }'

# Staging
curl -s -X POST "http://95.216.191.135:8000/api/v1/applications/public" \
  -H "Authorization: Bearer I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "<project-uuid>",
    "environment_name": "staging",
    "server_uuid": "xhqd61ecwp6n3k9068zqo6i6",
    "git_repository": "{owner}/{repo}",
    "git_branch": "develop",
    "build_pack": "nixpacks",
    "name": "<proje>-staging",
    "domains": "https://test.<proje>.ahmetgo.com",
    "ports_exposes": "3000",
    "install_command": "npm install"
  }'
```

> **NOT:** `install_command: "npm install"` her zaman ekle. Nixpacks varsayilan `npm ci` komutu bazi lockfile versiyonlarinda hata verir.

Ardindan **private_key_id'yi DB uzerinden ata** (API bu alani kabul etmiyor):

```bash
sshpass -p 'Ahmgon2341*+' ssh -o StrictHostKeyChecking=no root@95.216.191.135 \
  "docker exec coolify php artisan tinker --execute=\"
\\\$apps = \App\Models\Application::whereIn('uuid', ['<prod-uuid>', '<stg-uuid>'])->get();
foreach (\\\$apps as \\\$app) {
    \\\$app->git_repository = 'git@github.com:{owner}/{repo}.git';
    \\\$app->private_key_id = 1;
    \\\$app->save();
    echo \\\$app->name . ' updated\n';
}
\""
```

> **NEDEN DB GUNCELLEME GEREKLI:**
> - Coolify API `private_key_id` alanini PATCH ile kabul etmiyor
> - Uygulama once public olarak olusturulur, sonra DB'den SSH key atanir
> - `git_repository` de `git@github.com:` SSH formatina cevrilir

---

### Adim 5: GitHub Actions Deploy Workflow Ekle

> **ONEMLI:** Coolify webhook'u deploy key (SSH) tabanli kurulumlarda CALISMIYOR.
> Uygulamalar API ile olusturuldugunda `source_id: 0` kaliyor. Coolify webhook'u aliyor
> (200 OK donuyor) ama uygulamayla eslestiremedigi icin deploy tetiklemiyor.
> Bu nedenle GitHub Actions workflow kullanilmali.

1. `.github/workflows/deploy.yml` olustur:

```yaml
name: Deploy to Coolify

on:
  push:
    branches:
      - develop
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Deploy
        run: |
          if [ "${{ github.ref_name }}" = "main" ]; then
            UUID="<production-app-uuid>"
          else
            UUID="<staging-app-uuid>"
          fi

          curl -s -X POST \
            "http://95.216.191.135:8000/api/v1/deploy?uuid=${UUID}&force=true" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"
```

2. GitHub secret ekle:

```bash
gh secret set COOLIFY_API_TOKEN -R {owner}/{repo} -b "I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3"
```

---

### Adim 6: CI Workflow (Opsiyonel ama Onerilen)

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

---

### Adim 7: Domain & SSL

1. DNS zaten wildcard ile hazir (`*.ahmetgo.com` -> sunucu IP)
2. Coolify'da domain uygulama olusturulurken atandi
3. SSL otomatik (Let's Encrypt HTTP challenge -- Traefik)

> Ek bir sey yapmaya gerek yok. Ilk deploy sonrasi SSL sertifikasi otomatik alinir (1-2 dk).

---

### Adim 8: Test Deploy

```bash
# Manuel deploy tetikle
curl -s -X POST "http://95.216.191.135:8000/api/v1/deploy?uuid=<app-uuid>&force=true" \
  -H "Authorization: Bearer I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3"
```

> Ilk Nixpacks build'i yavas olabilir (~4-5 dk), sonrakiler cache sayesinde hizlidir.

---

## ENVIRONMENT VARIABLES

Coolify API ile env var ekleme:

```bash
curl -s -X POST "http://95.216.191.135:8000/api/v1/applications/<app-uuid>/envs" \
  -H "Authorization: Bearer I250iB2p8b8khXeUQfyt1ML6ToihnTo8h0nusk6U1a9ae8b3" \
  -H "Content-Type: application/json" \
  -d '{"key":"VITE_API_URL","value":"https://api.example.com","is_buildtime":true,"is_runtime":true}'
```

> Vite'da client-side env variable'lar `VITE_` prefix'i ile baslamali.
> `is_buildtime: true` olmali cunku Vite env variable'lari build sirasinda inject eder.

---

## POSTGRESQL ENTEGRASYONU (GEREKTIGINDE)

### Coolify'da PostgreSQL Kurulumu

PostgreSQL, Coolify projesi icinde kurulmali -- boylece app container'lari ile ayni internal Docker network'te olur.

1. Coolify Dashboard -> ilgili proje -> **New Resource** -> **PostgreSQL**
2. Olusan PostgreSQL'in **internal hostname**'ini ve sifresini al
3. `DATABASE_URL` formati: `postgres://postgres:<pass>@<internal-hostname>:5432/postgres`

> **KRITIK:** PostgreSQL hostname'i Coolify internal network'te gecerlidir. Lokal makineden bu adrese erisilemez.

### Mevcut PostgreSQL (iqloop projesi)

| Alan | Deger |
|------|-------|
| Container | j10tqzp5mr7pub0sje1f8k3r |
| User/Pass | postgres / 1XaEBqdf5BC2HNfVKATce9eFQchasaWWx2yFL19O48o5eW3Th7sVSlbuVI71juEN |
| Internal URL | postgres://postgres:1XaEBqdf5BC2HNfVKATce9eFQchasaWWx2yFL19O48o5eW3Th7sVSlbuVI71juEN@j10tqzp5mr7pub0sje1f8k3r:5432/postgres |

### Prisma Kullanacaksan

- **Prisma 6.x kullan** (7.x breaking change'ler iceriyor, henuz stabil degil)
- `getPrisma()` lazy pattern kullan (build sirasinda DB baglantisi denemesini onler)
- Dynamic import kullan: `const { getPrisma } = await import("@/lib/db")`
- Build komutu: `"build": "prisma generate && prisma migrate deploy && <framework-build>"`
- Lokal'den migration olusturmak icin `prisma migrate diff` kullan (sunucu DB'ye lokal'den erisilemez)

---

## TROUBLESHOOTING

### Deploy log kontrol

```bash
sshpass -p 'Ahmgon2341*+' ssh -o StrictHostKeyChecking=no root@95.216.191.135 \
  "docker exec coolify tail -50 /var/www/html/storage/logs/laravel.log"
```

### Sik Karsilasilan Hatalar ve Cozumleri

| Hata | Sebep | Cozum |
|------|-------|-------|
| `https://github.com/https://github.com/...` cift URL | `git_repository`'ye tam URL yazilmis | Sadece `owner/repo` formati kullan |
| `could not read Username for 'https://github.com'` | Private repo, SSH key yok | Deploy key ekle + DB'den `private_key_id` ata |
| `npm ci` exit code 1 | lockfileVersion / Node surumu uyumsuz | `install_command: "npm install"` override et |
| `This field is not allowed: private_key_id` | API bu alani kabul etmiyor | DB'den `php artisan tinker` ile guncelle |
| Webhook 200 OK ama deploy tetiklenmiyor | Deploy key kurulumunda `source_id: 0` kaliyor | GitHub Actions workflow kullan |
| SSL cakismasi / timeout | Cloudflare proxy acik | Cloudflare'de DNS only (gri bulut) kullan |
| Vite site aciliyor ama bos sayfa | `dist/` klasoru serve edilmiyor | `serve` veya `vite preview --host 0.0.0.0` kullan |
| `VITE_*` env variable'lar calismiyor | Build-time env olarak tanimlanmamis | Coolify'da `is_buildtime: true` yap |
| Git author access hatasi | Lokal git email Vercel/GitHub ile eslesmiyor | `git config user.email` ayarla |
| Ilk deploy basarisiz, ikinci basarili | Nixpacks cache sorunu | `force=true` ile tekrar deploy et |

---

## PROJE BILGILERI SABLONU

> Yeni projeye baslarken bu tabloyu doldur:

| Alan | Deger |
|------|-------|
| Proje Adi | |
| GitHub Repo | `git@github.com:ahmetgon/<repo>.git` |
| Framework | Vite + React + Tailwind |
| Node Version | 20 |
| Build Komutu | `npm run build` |
| Start Komutu | `npx serve dist -s -l 3000` |
| Install Komutu | `npm install` |
| Port | 3000 |
| Production Domain | `https://<proje>.ahmetgo.com` |
| Staging Domain | `https://test.<proje>.ahmetgo.com` |
| Coolify Project UUID | |
| Coolify Production App UUID | |
| Coolify Staging App UUID | |
| SSH Deploy Key ID | 1 |
| Veritabani Gerekli mi? | |

---

## NOTLAR

- Coolify v4 beta -- API degisebilir
- Container adlari UUID formatinda (Coolify v4 davranisi)
- `coolify-db` (postgres:15) Coolify'in kendi DB'si -- dokunma
- Public port acmak icin Hetzner Firewall'a kural eklenmeli
- Ilk Nixpacks build'i yavas (~4-5 dk), sonrakiler cache sayesinde hizli
- Tum repolar private -- her yeni repo icin deploy key eklemeyi unutma
- Cloudflare proxy her zaman kapali olmali
