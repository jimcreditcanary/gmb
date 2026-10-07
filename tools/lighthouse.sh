#!/bin/zsh
# Usage: ./lighthouse.sh <outdir> [baseOverride]   — one URL per template_guess, mobile + desktop, real (non-headless) Chrome
cd /Users/jamesfell/gmb/tools
OUT=${1:-/Users/jamesfell/gmb/audit/lighthouse-before}; BASE=$2; mkdir -p "$OUT"
node -e '
const inv=require("/Users/jamesfell/gmb/audit/raw/inventory.json");const seen={};
for(const r of Object.values(inv).sort((a,b)=>(a.source==="sitemap"?0:1)-(b.source==="sitemap"?0:1)||a.url.localeCompare(b.url))){if(r.kind!=="html"||r.status!==200||r.redirect_target||!r.title||r.hasPw)continue;const t=r.template_guess;if(!seen[t]){seen[t]=r.url;}}
for(const [t,u] of Object.entries(seen))console.log(t+" "+u)' > "$OUT/_targets.txt"
cp "${LH_TARGETS:-/Users/jamesfell/gmb/tools/lh-targets.txt}" "$OUT/_targets.txt"
cat "$OUT/_targets.txt"
while read tpl url; do
  [ -n "$BASE" ] && url=$(echo "$url" | sed "s#https://www.gmbcreditunion.com#$BASE#")
  for form in mobile desktop; do
    f="$OUT/${tpl}-${form}"; [ -f "$f.report.json" ] && continue
    if [ "$form" = "desktop" ]; then PRESET="--preset=desktop"; else PRESET=""; fi
    sleep 1
    npx lighthouse "$url" $PRESET --output=json --output=html --output-path="$f" --quiet --chrome-flags="--window-position=2000,0 --window-size=1440,900" --max-wait-for-load=60000 2>&1 | tail -1
    node -e 'const r=require(process.argv[1]+".report.json");console.log(process.argv[2],Object.entries(r.categories).map(([k,v])=>k+"="+Math.round(v.score*100)).join(" "),"LCP="+r.audits["largest-contentful-paint"].displayValue,"CLS="+r.audits["cumulative-layout-shift"].displayValue,"TBT="+r.audits["total-blocking-time"].displayValue)' "$f" "$tpl-$form" | tee -a "$OUT/_summary.txt"
  done
done < "$OUT/_targets.txt"
echo LIGHTHOUSE COMPLETE
