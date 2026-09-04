# 1PM Calculator
# MIT License, Copyright (c) 2026 Ivan Gladyshev
# Публикация приложения на GitHub с автоматическим деплоем на GitHub Pages.
# Запуск из папки проекта:  powershell -ExecutionPolicy Bypass -File setup-github.ps1
#
# Скрипт ничего не удаляет и не перезаписывает удалённый репозиторий:
# если репозиторий уже подключён, он только предложит запушить.

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Fail($message) {
    Write-Host ""
    Write-Host "  $message" -ForegroundColor Red
    exit 1
}

function Step($message) {
    Write-Host ""
    Write-Host "  $message" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "  Публикация приложения на GitHub" -ForegroundColor White

# --- Проверка инструментов -------------------------------------------------

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail "Не найден git. Установите его: https://git-scm.com/download/win"
}

$hasGh = [bool](Get-Command gh -ErrorAction SilentlyContinue)
if (-not $hasGh) {
    Write-Host ""
    Write-Host "  GitHub CLI (gh) не найден - репозиторий придётся создать вручную." -ForegroundColor Yellow
    Write-Host "  Поставить автоматически:  winget install --id GitHub.cli" -ForegroundColor Yellow
}

# --- Репозиторий -----------------------------------------------------------

if (Test-Path ".git") {
    Step "Репозиторий git уже есть, пропускаю инициализацию"
} else {
    Step "Создаю репозиторий git"
    git init -b main | Out-Null
}

Step "Добавляю файлы"
git add -A

# Коммитим только если есть что коммитить
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Изменений нет, коммит не нужен"
} else {
    git commit -m "1PM calculator: PWA for one-rep-max, muscle map, breathing" | Out-Null
    Write-Host "  Коммит создан"
}

# --- Удалённый репозиторий -------------------------------------------------

$remote = git remote get-url origin 2>$null

if ($remote) {
    Step "origin уже подключён: $remote"
    git push -u origin main
} elseif ($hasGh) {
    $status = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Step "Нужен вход в GitHub, откроется браузер"
        gh auth login
    }

    $name = Read-Host "  Имя репозитория (Enter - gym-1pm)"
    if ([string]::IsNullOrWhiteSpace($name)) { $name = "gym-1pm" }

    $visibility = Read-Host "  Публичный репозиторий? (Y - да, n - приватный)"
    $flag = if ($visibility -match '^[nN]') { "--private" } else { "--public" }

    Step "Создаю репозиторий на GitHub и заливаю код"
    gh repo create $name $flag --source=. --remote=origin --push
    if ($LASTEXITCODE -ne 0) { Fail "Не удалось создать репозиторий" }

    # GitHub Pages со сборкой из Actions: workflow уже лежит в .github/workflows
    Step "Включаю GitHub Pages"
    $repo = gh repo view --json nameWithOwner --jq .nameWithOwner
    gh api -X POST "repos/$repo/pages" -f "build_type=workflow" 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Не вышло включить автоматически." -ForegroundColor Yellow
        Write-Host "  Включите вручную: Settings - Pages - Source: GitHub Actions" -ForegroundColor Yellow
    }

    $owner, $repoName = $repo -split '/'
    Write-Host ""
    Write-Host "  Готово." -ForegroundColor Green
    Write-Host "  Репозиторий: https://github.com/$repo"
    Write-Host "  Сайт через пару минут: https://$owner.github.io/$repoName/"
    Write-Host "  Ход сборки: https://github.com/$repo/actions"
} else {
    Write-Host ""
    Write-Host "  Осталось сделать вручную:" -ForegroundColor Yellow
    Write-Host "  1. Создайте пустой репозиторий на https://github.com/new (без README)"
    Write-Host "  2. Выполните:"
    Write-Host "       git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ.git"
    Write-Host "       git push -u origin main"
    Write-Host "  3. Settings - Pages - Source: GitHub Actions"
}

Write-Host ""
Write-Host "  После деплоя откройте сайт на телефоне и добавьте на главный экран." -ForegroundColor White
Write-Host ""
