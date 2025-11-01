# Handoff – Spartan-MetaCoin (2025-11-02)

Branch: `handoff/2025-11-02`  
Repo: https://github.com/TheManticore99/Spartan-MetaCoin

## TL;DR
- Struktur standar Truffle, token tunggal `MetaToken.sol` (OpenZeppelin), kontrak `LeetTokenSender` untuk deposit/forward aset.
- Migrations diperbarui: deploy `MetaToken` (1,000,000 supply) lalu `LeetTokenSender`.
- Artefak `build/contracts/` di-commit sementara untuk memudahkan ABI/alamat.

## Apa yang Berubah
- Konsolidasi token: ganti `MyToken.sol` → `MetaToken.sol` (OZ ERC-20, constructor initialSupply).
- `MetaCoin.sol` kini impor `IERC20` dari OpenZeppelin (hapus interface lokal).
- Migrasi: tambah initial migration, update `2_deploy_contracts.js` untuk `MetaToken` + `LeetTokenSender`.
- Tambah folder `scripts/` untuk interaksi via `truffle exec`.

## Lingkungan & Versi
- Truffle, Web3.js, Node.js (tanpa top-level await di REPL).
- Solidity compiler: `0.8.20`.
- Dev network: `http://127.0.0.1:8545`, `network_id=1762022580577`, gas limit `30,000,000`.
- Akun default (Truffle develop[0]): `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1`.
- `.env` ter-load, tidak kritis saat ini.

## Struktur Repo
```
contracts/         ├─ ConvertLib.sol
                   ├─ MetaCoin.sol        ← berisi LeetTokenSender
                   ├─ MetaToken.sol       ← ERC-20 (OpenZeppelin)
                   └─ Migrations.sol
migrations/        ├─ 1_initial_migration.js
                   └─ 2_deploy_contracts.js
scripts/           ├─ 01_show-addresses.js
                   ├─ 02_seed-and-deposit.js
                   └─ 03_withdraw-to-owner.js
build/contracts/   ← artefak ABI + alamat (sementara di-track)
README.md / HANDOFF.md / package.json / .gitignore / ...
```

## Quickstart (Dev)
1) Install deps
```bash
npm install
```
2) Jalankan chain lokal
```bash
truffle develop
```
3) Deploy
```text
migrate --reset
```
4) Interaksi via skrip
```bash
truffle exec scripts/01_show-addresses.js --network development
truffle exec scripts/02_seed-and-deposit.js --network development
truffle exec scripts/03_withdraw-to-owner.js --network development
```

## Ringkasan Kontrak
- MetaToken (OZ ERC-20)
  - Decimals 18, mint awal ke deployer (1,000,000 token).
- LeetTokenSender (di MetaCoin.sol)
  - depositETH() payable: catat deposit ETH per user.
  - depositToken(token, amount): deposit ERC-20 (butuh approve).
  - getETHBalance(user) / getTokenBalance(token, user).
  - sendAllToOwner(address[] tokens): kirim saldo user (ETH+token list) ke owner kontrak.
  - changeOwner(newOwner): ganti owner.

## Status Deploy (terakhir di dev)
- Migrations: `0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E`
- MetaToken: `0x22d5C8BdD4346b390014a07109a8F830094d4abf`
- LeetTokenSender: `0x7414e38377D6DAf6045626EC8a8ABB8a1BC4B97a`

Catatan: ada redeploy lain untuk MetaToken (`0x970e…`). Sumber kebenaran: `build/contracts/MetaToken.json` → `networks[1762022580577].address`. Disarankan tulis ke `deployments/development.json`.

## Skrip Interaksi (ringkas)
- 01_show-addresses.js: cetak akun & alamat kontrak.
- 02_seed-and-deposit.js: approve + deposit token, deposit ETH, tampilkan saldo tercatat.
- 03_withdraw-to-owner.js: tarik semua saldo ke owner (wajib from = owner).

## Error Umum & Solusi
- "await is only valid in async functions": pakai `truffle exec` atau IIFE.
- "me is not defined / invalid address undefined": ambil akun via `await web3.eth.getAccounts()` dan set defaults `{ from: me }`.
- "ERC20: approve from the zero address": pastikan `from` ter-set sebelum approve.
- Custom error saat `sendAllToOwner`: panggil dari owner dan kirim array token valid.

## To-Do (Untuk Penerus)
- Unit tests: depositETH, depositToken, sendAllToOwner (sukses & gagal, duplikat token, amount 0, allowance kurang).
- Kebijakan folder `build/` (commit vs regenerate) + update `.gitignore` bila perlu.
- Registry alamat deploy (`deployments/development.json`).
- Perkaya custom errors/pesan revert dan logging skrip (tambahkan `04_show-balances.js`).