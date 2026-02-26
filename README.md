# rugplay-autobuyer ⚡

auto buys any coin on rugplay as fast as possible. works in the background too so you dont have to sit on the tab.

---

## what it does

- type in any coin + how much you want to spend per buy
- hits the buy button for you nonstop at max speed
- keeps going even when you switch tabs or leave the site (service worker)
- auto fills the coin if youre already on a coin page
- remembers your settings after refresh
- little draggable panel so its not in the way

---

## how to install

1. get [tampermonkey](https://www.tampermonkey.net/) for your browser
2. click the raw file link above → tampermonkey will pop up and ask you to install it
3. hit install, done

---

## how to use

1. go to rugplay.com and log in
2. the panel shows up bottom right
3. type your coin (ex: `GOFUNDME`) and your buy amount (ex: `1`)
4. hit start

thats it. to stop just hit the stop button. you can minimize the panel with the − button if its in the way.

---

## notes

- uses a service worker so it keeps buying even if you navigate away, as long as the browser is open
- if you close the browser it stops, but itll pick back up next time you open rugplay
- if it says "not logged in" just make sure youre signed into rugplay first
- if it says "insufficient funds" it keeps retrying automatically once you get more

---

rugplay is a fake crypto simulator, no real money. use this however you want.
