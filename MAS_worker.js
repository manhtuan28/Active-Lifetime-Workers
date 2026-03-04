// Cloudflare Worker for MAS (Microsoft Activation Scripts)
// Deploy to: get.tuancute.com
// Usage: irm https://get.tuancute.com | iex

const MAS_CMD_URL = 'https://software.tuancute.com/src/mas/MAS_AIO.cmd';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    const baseUrl = url.origin;

    // Route: /cmd — proxy the MAS_AIO.cmd with CRLF line endings
    if (url.pathname === '/cmd') {
      try {
        const resp = await fetch(MAS_CMD_URL, { cf: { cacheTtl: 300 } });
        if (!resp.ok) {
          return new Response('Failed to fetch MAS_AIO.cmd', { status: 502 });
        }
        let content = await resp.text();
        // Ensure CRLF line endings (critical for CMD label resolution)
        content = content.replace(/\r?\n/g, '\r\n');
        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        });
      } catch (e) {
        return new Response('Error: ' + e.message, { status: 500 });
      }
    }

    // Route: PowerShell loader (irm https://get.tuancute.com | iex)
    if (userAgent.includes('PowerShell')) {
      const ps = `
[console]::OutputEncoding = [System.Text.Encoding]::UTF8
$host.UI.RawUI.BackgroundColor = 'Black'
Clear-Host

$w = $host.UI.RawUI.WindowSize.Width
function Cen([string]$t,[string]$c='White'){
  $p = [math]::Max(0,[math]::Floor(($w - $t.Length)/2))
  Write-Host (' '*$p + $t) -ForegroundColor $c
}
function Bar([string]$c='DarkGray'){
  $len = [math]::Max(40, $w - 4)
  Write-Host ('  ' + ('='*$len)) -ForegroundColor $c
}

function Spin([string]$msg,[int]$ms){
  $f = @('|','/','-','\\\\')
  $s = [Diagnostics.Stopwatch]::StartNew(); $i=0
  while($s.ElapsedMilliseconds -lt $ms){
    Write-Host "\`r    $($f[$i%4]) $msg" -NoNewline -ForegroundColor DarkYellow
    $i++; Start-Sleep -Milliseconds 80
  }
  $s.Stop()
  Write-Host "\`r    " -NoNewline
  Write-Host "OK " -NoNewline -ForegroundColor Green
  Write-Host "$msg" -ForegroundColor Gray
}

Write-Host ""
Bar 'Cyan'
Cen "Microsoft Activation Scripts" "Cyan"
Cen "get.tuancute.com" "DarkGray"
Bar 'Cyan'
Write-Host ""

Spin "Dang ket noi may chu..." 800
Spin "Dang chuan bi moi truong..." 600

Write-Host ""

$cmdUrl = "${baseUrl}/cmd"
$tempPath = Join-Path $env:TEMP "MAS_AIO.cmd"

try {
  $cmdCode = Invoke-RestMethod -Uri $cmdUrl
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($tempPath, $cmdCode, $utf8NoBom)
  Write-Host "    " -NoNewline; Write-Host "[OK]" -NoNewline -ForegroundColor Green; Write-Host " Tai thanh cong." -ForegroundColor White
} catch {
  Write-Host "    " -NoNewline; Write-Host "[X]" -NoNewline -ForegroundColor Red; Write-Host " Loi tai file. Kiem tra ket noi mang." -ForegroundColor Red
  Write-Host ""
  Write-Host "    Nhan phim bat ky de thoat..." -ForegroundColor DarkGray
  $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
  return
}

Write-Host ""

$launched = $false
try {
  $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c \`"$tempPath\`" -qedit" -Verb RunAs -PassThru
  $launched = $true
} catch {
  $launched = $false
}

if ($launched -and $proc) {
  Write-Host "    " -NoNewline; Write-Host "OK" -NoNewline -ForegroundColor Green; Write-Host " Da khoi chay thanh cong." -ForegroundColor Green
  Write-Host ""
  Write-Host "    " -NoNewline; Write-Host "Can ho tro? Truy cap " -NoNewline -ForegroundColor DarkGray; Write-Host "get.tuancute.com" -ForegroundColor Cyan
  Write-Host ""

  $pid2 = $proc.Id
  while ($true) {
    Start-Sleep -Milliseconds 800
    $running = Get-Process -Id $pid2 -ErrorAction SilentlyContinue
    if (-not $running) { break }
  }

  Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
} else {
  Write-Host ""
  Write-Host "    [X] Ban da tu choi cap quyen Admin hoac co loi." -ForegroundColor Red
  Write-Host "    [!] Vui long chay lai lenh voi quyen Administrator." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "    Nhan phim bat ky de thoat..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
      `;

      return new Response(ps.trim(), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Route: HTML landing page for browsers
    const htmlPage = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Microsoft Activation Scripts v3.10 &mdash; get.tuancute.com</title>
<meta name="description" content="K\u00edch ho\u1ea1t Windows &amp; Office mi\u1ec5n ph\u00ed v\u1edbi HWID, Ohook, TSforge, KMS. H\u01b0\u1edbng d\u1eabn chi ti\u1ebft b\u1eb1ng ti\u1ebfng Vi\u1ec7t.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--blue:#1565c0;--blue-light:#1976d2;--blue-bg:#e3f2fd;--blue-dark:#0d47a1;--green:#2e7d32;--green-light:#e8f5e9;--orange:#f57f17;--orange-bg:#fff8e1;--gray:#666;--gray-light:#f5f7fa;--border:#e0e4e8;--radius:12px;--shadow:0 2px 12px rgba(0,0,0,.06)}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{min-height:100vh;font-family:'Inter','Segoe UI',sans-serif;background:var(--gray-light);color:#333;display:flex;flex-direction:column}
a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline}

/* Top bar */
.topbar{width:100%;background:linear-gradient(135deg,var(--blue),var(--blue-light));padding:10px 0;text-align:center;color:#fff;font-size:12px;letter-spacing:.3px}
.topbar a{color:#bbdefb;text-decoration:underline}

/* Header */
.header{width:100%;background:#fff;border-bottom:1px solid var(--border);padding:28px 0 22px;text-align:center}
.header h1{font-size:30px;font-weight:800;color:var(--blue);letter-spacing:-.5px}
.header h1 span{color:var(--gray);font-weight:400;font-size:20px}
.header p{color:#888;font-size:13px;margin-top:6px}
.ver-badge{display:inline-block;background:var(--blue-bg);color:var(--blue);font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;margin-left:6px;vertical-align:middle}

/* Nav */
.nav{width:100%;background:#fff;border-bottom:1px solid var(--border);padding:0;overflow-x:auto;-webkit-overflow-scrolling:touch}
.nav-inner{max-width:900px;margin:0 auto;display:flex;gap:0;padding:0 16px}
.nav a{padding:12px 18px;font-size:13px;font-weight:600;color:var(--gray);white-space:nowrap;border-bottom:2px solid transparent;transition:all .2s}
.nav a:hover,.nav a.active{color:var(--blue);border-bottom-color:var(--blue);text-decoration:none}

/* Main */
.main{max-width:800px;width:94%;margin:28px auto 40px;flex:1}

/* Cards */
.card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:28px 32px;margin-bottom:20px;box-shadow:var(--shadow)}
.card h2{font-size:20px;font-weight:700;color:var(--blue-dark);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.card h2 .icon{width:32px;height:32px;background:var(--blue-bg);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px}
.card h3{font-size:15px;font-weight:700;color:#333;margin:18px 0 8px}
.card p,.card li{font-size:14px;line-height:1.75;color:#555}

/* Install steps */
.steps{counter-reset:s}
.step{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #f0f2f5;align-items:flex-start}
.step:last-child{border-bottom:none}
.step::before{counter-increment:s;content:counter(s);flex-shrink:0;width:32px;height:32px;background:var(--blue-light);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.step-text{font-size:14px;line-height:1.75;color:#444}
.step-text strong{color:#222}
.step-text code{background:#f0f2f5;padding:2px 7px;border-radius:4px;font-family:'JetBrains Mono',Consolas,monospace;font-size:13px;color:#c0392b}

/* Command box */
.cmd-area{background:#1a1a2e;border-radius:10px;padding:20px 22px;margin:20px 0;display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid #2d2d44}
.cmd-area code{font-family:'JetBrains Mono','Fira Code',Consolas,monospace;font-size:15px;color:#7ec8e3;flex:1;letter-spacing:.3px}
.cmd-area .pipe{color:#888}
.copy-btn{background:var(--blue-light);color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'Inter',sans-serif}
.copy-btn:hover{background:var(--blue);transform:translateY(-1px)}
.copy-btn.ok{background:var(--green)}

/* Method cards */
.methods{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
@media(max-width:600px){.methods{grid-template-columns:1fr}}
.method{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:all .2s;position:relative;overflow:hidden}
.method:hover{border-color:var(--blue-light);box-shadow:0 4px 16px rgba(21,101,192,.1)}
.method .num{position:absolute;top:12px;right:14px;font-size:11px;font-weight:700;color:#bbb;letter-spacing:.5px}
.method h4{font-size:16px;font-weight:700;color:var(--blue);margin-bottom:6px;display:flex;align-items:center;gap:8px}
.method h4 .tag{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:600;text-transform:uppercase;letter-spacing:.3px}
.tag-perm{background:var(--green-light);color:var(--green)}
.tag-renew{background:var(--orange-bg);color:var(--orange)}
.method p{font-size:13px;color:#666;line-height:1.6}
.method .support{margin-top:8px;display:flex;flex-wrap:wrap;gap:4px}
.method .support span{font-size:11px;background:var(--gray-light);color:#555;padding:2px 8px;border-radius:4px;font-weight:500}

/* Tools section */
.tools-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:14px}
@media(max-width:700px){.tools-grid{grid-template-columns:1fr 1fr}}
@media(max-width:450px){.tools-grid{grid-template-columns:1fr}}
.tool-item{background:var(--gray-light);border:1px solid var(--border);border-radius:10px;padding:16px;text-align:center;transition:all .2s}
.tool-item:hover{border-color:var(--blue-light);background:#fff}
.tool-item .tool-icon{font-size:24px;margin-bottom:6px}
.tool-item h5{font-size:13px;font-weight:700;color:#333;margin-bottom:4px}
.tool-item p{font-size:12px;color:#888;line-height:1.5}

/* Table */
.compare-table{width:100%;border-collapse:collapse;margin-top:14px;font-size:13px}
.compare-table th{background:var(--blue);color:#fff;padding:10px 14px;text-align:left;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.3px}
.compare-table td{padding:10px 14px;border-bottom:1px solid #f0f2f5;color:#444}
.compare-table tr:hover td{background:var(--blue-bg)}
.compare-table .check{color:var(--green);font-weight:700}
.compare-table .cross{color:#ccc}

/* Info & warning */
.info{background:var(--blue-bg);border-left:4px solid var(--blue-light);border-radius:0 var(--radius) var(--radius) 0;padding:16px 20px;font-size:13px;color:var(--blue);line-height:1.7;margin:16px 0}
.info b{color:var(--blue-dark)}
.warn{background:var(--orange-bg);border-left:4px solid #f9a825;border-radius:0 var(--radius) var(--radius) 0;padding:16px 20px;font-size:13px;color:var(--orange);line-height:1.7;margin:16px 0}

/* Parameter docs */
.param-list{list-style:none;margin-top:10px}
.param-list li{padding:8px 0;border-bottom:1px solid #f0f2f5;font-size:13px;display:flex;gap:10px;align-items:baseline}
.param-list li:last-child{border-bottom:none}
.param-list code{background:#f0f2f5;padding:3px 8px;border-radius:4px;font-family:'JetBrains Mono',Consolas,monospace;font-size:12px;color:var(--blue);font-weight:600;white-space:nowrap}

/* Extras */
.extras-list{list-style:none;margin-top:10px}
.extras-list li{padding:10px 0;border-bottom:1px solid #f0f2f5;display:flex;gap:12px;align-items:flex-start}
.extras-list li:last-child{border-bottom:none}
.extras-list .e-icon{width:28px;height:28px;background:var(--blue-bg);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.extras-list .e-text h5{font-size:14px;font-weight:600;color:#333;margin-bottom:2px}
.extras-list .e-text p{font-size:13px;color:#888}

/* FAQ */
.faq-item{padding:14px 0;border-bottom:1px solid #f0f2f5}
.faq-item:last-child{border-bottom:none}
.faq-item summary{font-size:14px;font-weight:600;color:#333;cursor:pointer;padding:4px 0;list-style:none;display:flex;align-items:center;gap:8px}
.faq-item summary::before{content:'+';font-size:18px;font-weight:700;color:var(--blue);width:20px;text-align:center}
.faq-item[open] summary::before{content:'\u2212'}
.faq-item .faq-body{padding:8px 0 4px 28px;font-size:13px;color:#666;line-height:1.7}

/* Footer */
.footer{width:100%;background:#fff;border-top:1px solid var(--border);padding:20px 0;text-align:center;font-size:12px;color:#999}
.footer a{color:var(--blue-light)}
.footer .footer-links{margin-bottom:8px}
.footer .footer-links a{margin:0 10px;font-weight:500}
</style>
</head>
<body>

<div class="topbar">K\u00edch ho\u1ea1t Windows &amp; Office b\u1ea3n quy\u1ec1n mi\u1ec5n ph\u00ed &mdash; <a href="https://tuancute.com" target="_blank">tuancute.com</a></div>

<div class="header">
  <h1>Microsoft Activation Scripts <span class="ver-badge">v3.10</span></h1>
  <p>HWID &bull; Ohook &bull; TSforge &bull; KMS &bull; IDM &bull; WinRAR &mdash; C\u00f4ng c\u1ee5 k\u00edch ho\u1ea1t m\u1ea1nh m\u1ebd nh\u1ea5t</p>
</div>

<div class="nav"><div class="nav-inner">
  <a href="#install" class="active">\u26A1 C\u00e0i \u0111\u1eb7t</a>
  <a href="#methods">\u{1F511} Ph\u01b0\u01a1ng th\u1ee9c</a>
  <a href="#compare">\u{1F4CA} So s\u00e1nh</a>
  <a href="#tools">\u{1F6E0} C\u00f4ng c\u1ee5</a>
  <a href="#params">\u{1F4DD} Tham s\u1ed1</a>
  <a href="#extras">\u{1F4E6} Extras</a>
  <a href="#faq">\u2753 FAQ</a>
</div></div>

<div class="main">

  <!-- INSTALL -->
  <div class="card" id="install">
    <h2><div class="icon">\u26A1</div> H\u01b0\u1edbng d\u1eabn c\u00e0i \u0111\u1eb7t nhanh</h2>
    <div class="steps">
      <div class="step">
        <div class="step-text">Nh\u1ea5n t\u1ed5 h\u1ee3p ph\u00edm <strong>Win + X</strong>, ch\u1ecdn <strong>Windows PowerShell (Admin)</strong> ho\u1eb7c <strong>Terminal (Admin)</strong></div>
      </div>
      <div class="step">
        <div class="step-text">Sao ch\u00e9p l\u1ec7nh b\u00ean d\u01b0\u1edbi, d\u00e1n v\u00e0o c\u1eeda s\u1ed5 PowerShell v\u00e0 nh\u1ea5n <strong>Enter</strong></div>
      </div>
      <div class="step">
        <div class="step-text">Ch\u1ecdn ph\u01b0\u01a1ng th\u1ee9c k\u00edch ho\u1ea1t t\u1eeb menu (HWID, Ohook, TSforge, KMS...) v\u00e0 l\u00e0m theo h\u01b0\u1edbng d\u1eabn</div>
      </div>
    </div>
    <div class="cmd-area">
      <code id="ct">irm ${baseUrl} <span class="pipe">|</span> iex</code>
      <button class="copy-btn" id="cb" onclick="cc()">Sao ch\u00e9p</button>
    </div>
    <div class="info">
      <b>L\u01b0u \u00fd:</b> B\u1eaft bu\u1ed9c ch\u1ea1y PowerShell v\u1edbi quy\u1ec1n <b>Administrator</b>. Script s\u1ebd t\u1ef1 \u0111\u1ed9ng t\u1ea3i v\u00e0 kh\u1edfi ch\u1ea1y MAS v\u1edbi giao di\u1ec7n menu \u0111\u1ea7y \u0111\u1ee7.
    </div>
  </div>

  <!-- ACTIVATION METHODS -->
  <div class="card" id="methods">
    <h2><div class="icon">\u{1F511}</div> Ph\u01b0\u01a1ng th\u1ee9c k\u00edch ho\u1ea1t</h2>
    <p>MAS h\u1ed7 tr\u1ee3 4 ph\u01b0\u01a1ng th\u1ee9c k\u00edch ho\u1ea1t kh\u00e1c nhau, ph\u00f9 h\u1ee3p v\u1edbi m\u1ecdi nhu c\u1ea7u:</p>
    <div class="methods">
      <div class="method">
        <div class="num">[1]</div>
        <h4>\u{1F4BB} HWID <span class="tag tag-perm">V\u0128NH VI\u1ec4N</span></h4>
        <p>K\u00edch ho\u1ea1t Windows b\u1eb1ng Digital License. Kh\u00f4ng c\u1ea7n c\u00e0i th\u00eam g\u00ec, k\u00edch ho\u1ea1t v\u0129nh vi\u1ec5n g\u1eafn v\u1edbi ph\u1ea7n c\u1ee9ng m\u00e1y.</p>
        <div class="support"><span>Windows 10</span><span>Windows 11</span><span>Server 2016+</span></div>
      </div>
      <div class="method">
        <div class="num">[2]</div>
        <h4>\u{1F4C4} Ohook <span class="tag tag-perm">V\u0128NH VI\u1ec4N</span></h4>
        <p>K\u00edch ho\u1ea1t Office b\u1eb1ng c\u00e1ch hook h\u00e0m ki\u1ec3m tra license. Ho\u1ea1t \u0111\u1ed9ng offline, kh\u00f4ng c\u1ea7n gia h\u1ea1n.</p>
        <div class="support"><span>Office 2016</span><span>Office 2019</span><span>Office 2021</span><span>Office 2024</span><span>M365</span></div>
      </div>
      <div class="method">
        <div class="num">[3]</div>
        <h4>\u{1F527} TSforge <span class="tag tag-perm">V\u0128NH VI\u1ec4N</span></h4>
        <p>Ph\u01b0\u01a1ng th\u1ee9c m\u1ea1nh nh\u1ea5t \u2014 k\u00edch ho\u1ea1t Windows, Office v\u00e0 ESU. Ghi tr\u1ef1c ti\u1ebfp d\u1eef li\u1ec7u license v\u00e0o h\u1ec7 th\u1ed1ng.</p>
        <div class="support"><span>Windows 7+</span><span>Office 2010+</span><span>ESU</span><span>Server</span></div>
      </div>
      <div class="method">
        <div class="num">[4]</div>
        <h4>\u{1F310} Online KMS <span class="tag tag-renew">180 NG\u00c0Y</span></h4>
        <p>K\u00edch ho\u1ea1t qua m\u00e1y ch\u1ee7 KMS online. T\u1ef1 \u0111\u1ed9ng gia h\u1ea1n m\u1ed7i 180 ng\u00e0y (c\u1ea7n Internet).</p>
        <div class="support"><span>Windows 8+</span><span>Office 2010+</span><span>Server</span></div>
      </div>
    </div>
  </div>

  <!-- COMPARISON TABLE -->
  <div class="card" id="compare">
    <h2><div class="icon">\u{1F4CA}</div> B\u1ea3ng so s\u00e1nh ph\u01b0\u01a1ng th\u1ee9c</h2>
    <table class="compare-table">
      <thead><tr><th>T\u00ednh n\u0103ng</th><th>HWID</th><th>Ohook</th><th>TSforge</th><th>KMS</th></tr></thead>
      <tbody>
        <tr><td>K\u00edch ho\u1ea1t Windows</td><td class="check">\u2714</td><td class="cross">\u2014</td><td class="check">\u2714</td><td class="check">\u2714</td></tr>
        <tr><td>K\u00edch ho\u1ea1t Office</td><td class="cross">\u2014</td><td class="check">\u2714</td><td class="check">\u2714</td><td class="check">\u2714</td></tr>
        <tr><td>K\u00edch ho\u1ea1t ESU</td><td class="cross">\u2014</td><td class="cross">\u2014</td><td class="check">\u2714</td><td class="cross">\u2014</td></tr>
        <tr><td>V\u0129nh vi\u1ec5n</td><td class="check">\u2714</td><td class="check">\u2714</td><td class="check">\u2714</td><td class="cross">180 ng\u00e0y</td></tr>
        <tr><td>Offline</td><td class="cross">\u2014</td><td class="check">\u2714</td><td class="check">\u2714</td><td class="cross">\u2014</td></tr>
        <tr><td>Windows 7 / 8.1</td><td class="cross">\u2014</td><td class="cross">\u2014</td><td class="check">\u2714</td><td class="check">\u2714</td></tr>
      </tbody>
    </table>
  </div>

  <!-- TOOLS -->
  <div class="card" id="tools">
    <h2><div class="icon">\u{1F6E0}</div> C\u00f4ng c\u1ee5 t\u00edch h\u1ee3p</h2>
    <p>Ngo\u00e0i k\u00edch ho\u1ea1t, MAS c\u00f2n cung c\u1ea5p nhi\u1ec1u c\u00f4ng c\u1ee5 h\u1eefu \u00edch:</p>
    <div class="tools-grid">
      <div class="tool-item">
        <div class="tool-icon">\u2705</div>
        <h5>Ki\u1ec3m tra tr\u1ea1ng th\u00e1i</h5>
        <p>Xem chi ti\u1ebft tr\u1ea1ng th\u00e1i k\u00edch ho\u1ea1t Windows &amp; Office hi\u1ec7n t\u1ea1i [5]</p>
      </div>
      <div class="tool-item">
        <div class="tool-icon">\u{1F4BB}</div>
        <h5>\u0110\u1ed5i phi\u00ean b\u1ea3n Win</h5>
        <p>Chuy\u1ec3n \u0111\u1ed5i phi\u00ean b\u1ea3n Windows (Home \u2192 Pro...) [6]</p>
      </div>
      <div class="tool-item">
        <div class="tool-icon">\u{1F4C4}</div>
        <h5>\u0110\u1ed5i phi\u00ean b\u1ea3n Office</h5>
        <p>Chuy\u1ec3n \u0111\u1ed5i phi\u00ean b\u1ea3n Microsoft Office [7]</p>
      </div>
      <div class="tool-item">
        <div class="tool-icon">\u{1F680}</div>
        <h5>Active IDM</h5>
        <p>K\u00edch ho\u1ea1t Internet Download Manager v\u0129nh vi\u1ec5n [8]</p>
      </div>
      <div class="tool-item">
        <div class="tool-icon">\u{1F4E6}</div>
        <h5>Active WinRAR</h5>
        <p>T\u1ea3i, c\u00e0i \u0111\u1eb7t v\u00e0 k\u00edch ho\u1ea1t WinRAR v\u0129nh vi\u1ec5n [9]</p>
      </div>
      <div class="tool-item">
        <div class="tool-icon">\u{1F41B}</div>
        <h5>Kh\u1eafc ph\u1ee5c s\u1ef1 c\u1ed1</h5>
        <p>S\u1eeda l\u1ed7i k\u00edch ho\u1ea1t, DISM, SFC Scan [T]</p>
      </div>
      <div class="tool-item">
        <div class="tool-icon">\u{1F4C1}</div>
        <h5>Extras</h5>
        <p>Xu\u1ea5t $OEM$ folder, t\u1ea3i Windows/Office g\u1ed1c [E]</p>
      </div>
    </div>
  </div>

  <!-- COMMAND LINE PARAMS -->
  <div class="card" id="params">
    <h2><div class="icon">\u{1F4DD}</div> Tham s\u1ed1 d\u00f2ng l\u1ec7nh</h2>
    <p>Ch\u1ea1y tr\u1ef1c ti\u1ebfp kh\u00f4ng c\u1ea7n menu (ch\u1ebf \u0111\u1ed9 t\u1ef1 \u0111\u1ed9ng):</p>
    <ul class="param-list">
      <li><code>/HWID</code> K\u00edch ho\u1ea1t Windows b\u1eb1ng HWID</li>
      <li><code>/Ohook</code> K\u00edch ho\u1ea1t Office b\u1eb1ng Ohook</li>
      <li><code>/Z-Windows</code> TSforge \u2014 K\u00edch ho\u1ea1t Windows</li>
      <li><code>/Z-Office</code> TSforge \u2014 K\u00edch ho\u1ea1t Office</li>
      <li><code>/Z-ESU</code> TSforge \u2014 K\u00edch ho\u1ea1t ESU updates</li>
      <li><code>/Z-WindowsESUOffice</code> TSforge \u2014 K\u00edch ho\u1ea1t t\u1ea5t c\u1ea3</li>
      <li><code>/K-Windows</code> Online KMS \u2014 K\u00edch ho\u1ea1t Windows</li>
      <li><code>/K-Office</code> Online KMS \u2014 K\u00edch ho\u1ea1t Office</li>
      <li><code>/K-WindowsOffice</code> Online KMS \u2014 K\u00edch ho\u1ea1t c\u1ea3 hai</li>
    </ul>
    <div class="info" style="margin-top:16px">
      <b>V\u00ed d\u1ee5:</b> \u0110\u1ec3 k\u00edch ho\u1ea1t Windows b\u1eb1ng HWID t\u1ef1 \u0111\u1ed9ng, d\u00f9ng tham s\u1ed1 <code>/HWID</code> khi ch\u1ea1y MAS_AIO.cmd
    </div>
  </div>

  <!-- EXTRAS -->
  <div class="card" id="extras">
    <h2><div class="icon">\u{1F4E6}</div> Extras [E]</h2>
    <ul class="extras-list">
      <li>
        <div class="e-icon">\u{1F4C1}</div>
        <div class="e-text">
          <h5>Extract $OEM$ Folder</h5>
          <p>Xu\u1ea5t th\u01b0 m\u1ee5c $OEM$ \u0111\u1ec3 t\u00edch h\u1ee3p k\u00edch ho\u1ea1t t\u1ef1 \u0111\u1ed9ng khi c\u00e0i Windows t\u1eeb USB. H\u1ed7 tr\u1ee3 nhi\u1ec1u t\u1ed5 h\u1ee3p: HWID, Ohook, TSforge, KMS ho\u1eb7c k\u1ebft h\u1ee3p.</p>
        </div>
      </li>
      <li>
        <div class="e-icon">\u{2B07}</div>
        <div class="e-text">
          <h5>Download Genuine Windows / Office</h5>
          <p>T\u1ea3i b\u1ed9 c\u00e0i Windows v\u00e0 Office ch\u00ednh h\u00e3ng tr\u1ef1c ti\u1ebfp t\u1eeb Microsoft.</p>
        </div>
      </li>
    </ul>
  </div>

  <!-- FAQ -->
  <div class="card" id="faq">
    <h2><div class="icon">\u2753</div> C\u00e2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p</h2>
    <details class="faq-item">
      <summary>N\u00ean ch\u1ecdn ph\u01b0\u01a1ng th\u1ee9c n\u00e0o?</summary>
      <div class="faq-body">
        <strong>Windows 10/11:</strong> D\u00f9ng <b>HWID</b> (v\u0129nh vi\u1ec5n, \u0111\u01a1n gi\u1ea3n nh\u1ea5t).<br>
        <strong>Office:</strong> D\u00f9ng <b>Ohook</b> (v\u0129nh vi\u1ec5n, offline).<br>
        <strong>Windows 7/8.1 ho\u1eb7c c\u1ea7n t\u1ea5t c\u1ea3:</strong> D\u00f9ng <b>TSforge</b> (h\u1ed7 tr\u1ee3 m\u1ecdi th\u1ee9).<br>
        <strong>Kh\u00f4ng th\u1ec3 d\u00f9ng c\u00e1c c\u00e1ch tr\u00ean:</strong> D\u00f9ng <b>Online KMS</b>.
      </div>
    </details>
    <details class="faq-item">
      <summary>K\u00edch ho\u1ea1t c\u00f3 an to\u00e0n kh\u00f4ng?</summary>
      <div class="faq-body">MAS l\u00e0 c\u00f4ng c\u1ee5 m\u00e3 ngu\u1ed3n m\u1edf, b\u1ea1n c\u00f3 th\u1ec3 ki\u1ec3m tra to\u00e0n b\u1ed9 m\u00e3 ngu\u1ed3n. Kh\u00f4ng ch\u1ee9a virus, kh\u00f4ng g\u1eedi d\u1eef li\u1ec7u c\u00e1 nh\u00e2n.</div>
    </details>
    <details class="faq-item">
      <summary>C\u1ea7n Internet kh\u00f4ng?</summary>
      <div class="faq-body"><b>HWID:</b> C\u1ea7n Internet l\u1ea7n \u0111\u1ea7u. <b>Ohook &amp; TSforge:</b> Ho\u00e0n to\u00e0n offline. <b>Online KMS:</b> C\u1ea7n Internet \u0111\u1ec3 gia h\u1ea1n m\u1ed7i 180 ng\u00e0y.</div>
    </details>
    <details class="faq-item">
      <summary>Windows b\u00e1o virus / b\u1ecb ch\u1eb7n?</summary>
      <div class="faq-body">M\u1ed9t s\u1ed1 antivirus c\u00f3 th\u1ec3 c\u1ea3nh b\u00e1o nh\u1ea7m. \u0110\u00e2y l\u00e0 false positive v\u00ec script thao t\u00e1c v\u1edbi license h\u1ec7 th\u1ed1ng. B\u1ea1n c\u00f3 th\u1ec3 t\u1ea1m t\u1eaft Windows Defender ho\u1eb7c th\u00eam ngo\u1ea1i l\u1ec7 cho script.</div>
    </details>
    <details class="faq-item">
      <summary>L\u00e0m sao \u0111\u1ec3 c\u00e0i Windows t\u1ef1 \u0111\u1ed9ng k\u00edch ho\u1ea1t?</summary>
      <div class="faq-body">D\u00f9ng t\u00ednh n\u0103ng <b>Extract $OEM$ Folder</b> trong m\u1ee5c Extras. Ch\u00e9p th\u01b0 m\u1ee5c $OEM$ v\u00e0o USB c\u00e0i Windows, h\u1ec7 th\u1ed1ng s\u1ebd t\u1ef1 k\u00edch ho\u1ea1t sau khi c\u00e0i xong.</div>
    </details>
    <details class="faq-item">
      <summary>Active IDM Lifetime l\u00e0 g\u00ec?</summary>
      <div class="faq-body">T\u00edch h\u1ee3p s\u1eb5n trong menu [8], gi\u00fap k\u00edch ho\u1ea1t Internet Download Manager v\u0129nh vi\u1ec5n. Script s\u1ebd t\u1ef1 \u0111\u1ed9ng t\u1ea3i v\u00e0 ch\u1ea1y c\u00f4ng c\u1ee5 t\u1eeb <a href="https://idm.tuancute.com" target="_blank">idm.tuancute.com</a>.</div>
    </details>
    <details class="faq-item">
      <summary>Active WinRAR Lifetime l\u00e0 g\u00ec?</summary>
      <div class="faq-body">T\u00edch h\u1ee3p s\u1eb5n trong menu [9], gi\u00fap t\u1ea3i, c\u00e0i \u0111\u1eb7t v\u00e0 k\u00edch ho\u1ea1t b\u1ea3n quy\u1ec1n WinRAR v\u0129nh vi\u1ec5n (General Public License). H\u1ed7 tr\u1ee3 t\u1ef1 \u0111\u1ed9ng detect phi\u00ean b\u1ea3n m\u1edbi nh\u1ea5t t\u1eeb rarlab.com, c\u00e0i \u0111\u1eb7t im l\u1eb7ng v\u00e0 ghi file rarreg.key. C\u00f3 th\u1ec3 g\u1ee1 license ho\u1eb7c g\u1ee1 c\u00e0i \u0111\u1eb7t WinRAR.</div>
    </details>
  </div>

  <!-- SYSTEM REQUIREMENTS -->
  <div class="card">
    <h2><div class="icon">\u{1F4BB}</div> Y\u00eau c\u1ea7u h\u1ec7 th\u1ed1ng</h2>
    <div class="step-text" style="padding:8px 0">
      <strong>H\u1ec7 \u0111i\u1ec1u h\u00e0nh:</strong> Windows 7 / 8 / 8.1 / 10 / 11 / Server (2008 R2+)<br>
      <strong>Office:</strong> Office 2010 / 2013 / 2016 / 2019 / 2021 / 2024 / Microsoft 365<br>
      <strong>PowerShell:</strong> Phi\u00ean b\u1ea3n 3.0+ (\u0111\u00e3 c\u00f3 s\u1eb5n tr\u00ean Windows 8+)<br>
      <strong>Quy\u1ec1n:</strong> C\u1ea7n ch\u1ea1y v\u1edbi quy\u1ec1n <strong>Administrator</strong><br>
      <strong>K\u1ebft n\u1ed1i:</strong> C\u1ea7n Internet \u0111\u1ec3 t\u1ea3i script (HWID c\u1ea7n Internet l\u1ea7n \u0111\u1ea7u, Ohook/TSforge offline)
    </div>
  </div>

  <!-- WARNING -->
  <div class="warn">
    <b>\u26A0 L\u01b0u \u00fd:</b> C\u00f4ng c\u1ee5 n\u00e0y ch\u1ec9 d\u00f9ng cho m\u1ee5c \u0111\u00edch h\u1ecdc t\u1eadp v\u00e0 nghi\u00ean c\u1ee9u.
    N\u1ebfu th\u1ea5y h\u1eefu \u00edch, h\u00e3y \u1ee7ng h\u1ed9 Microsoft b\u1eb1ng c\u00e1ch mua b\u1ea3n quy\u1ec1n ch\u00ednh th\u1ee9c t\u1ea1i <a href="https://www.microsoft.com" target="_blank" style="color:var(--orange);font-weight:700">microsoft.com</a>.
  </div>

</div>

<div class="footer">
  <div class="footer-links">
    <a href="https://tuancute.com" target="_blank">tuancute.com</a>
    <a href="https://idm.tuancute.com" target="_blank">IDM Activation</a>
    <a href="https://massgrave.dev" target="_blank">MAS Docs</a>
  </div>
  &copy; 2026 Tuancute28 &bull; Based on Microsoft Activation Scripts by massgrave.dev
</div>

<script>
function cc(){
  navigator.clipboard.writeText('irm ${baseUrl} | iex').then(()=>{
    const b=document.getElementById('cb');
    b.classList.add('ok');b.textContent='\u0110\u00e3 sao ch\u00e9p!';
    setTimeout(()=>{b.classList.remove('ok');b.textContent='Sao ch\u00e9p'},2000)
  })
}
// Smooth nav highlight
document.querySelectorAll('.nav a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    document.querySelectorAll('.nav a').forEach(n=>n.classList.remove('active'));
    a.classList.add('active');
  })
})
</script>
</body>
</html>`;

    return new Response(htmlPage, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
};

