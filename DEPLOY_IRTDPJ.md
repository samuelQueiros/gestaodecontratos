# Deploy e geracao dos dados IRTDPJ

Este projeto usa o token da API somente via variavel de ambiente. Nao grave tokens reais em arquivos do repositorio.

## 1. Preparar o servidor

```bash
cd /caminho/do/projeto/gestaodecontrato
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-irtdpj.txt

cd gestaocontratov1
npm ci
```

No Windows, ative o ambiente com:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 2. Gerar tudo do zero pela API

Na raiz `gestaodecontrato`, defina o token e rode o sincronizador:

```bash
export IRTDPJ_TOKEN="<SEU_TOKEN_IRTDPJ>"
python sync_irtdpj.py
```

No PowerShell:

```powershell
$env:IRTDPJ_TOKEN="<SEU_TOKEN_IRTDPJ>"
python sync_irtdpj.py
```

Esse comando gera:

- `associados.xlsx`
- `detalhe_remessas.xlsx`
- `extrato_por_cartorio.xlsx`
- `gestaocontratov1/public/data/irtdpj.json`

## 3. Gerar o JSON a partir das planilhas existentes

Use quando as planilhas ja existirem e voce nao quiser chamar a API:

```bash
python export_irtdpj_frontend_data.py
```

## 4. Build do frontend

```bash
cd gestaocontratov1
npm run build
```

O resultado fica em `gestaocontratov1/dist`.

## 5. Validacao rapida

```bash
npm run lint
npm run build
```

Para desenvolvimento local:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

A visao IRTDPJ fica em:

```text
http://localhost:5173/associados-irtdpj
```
