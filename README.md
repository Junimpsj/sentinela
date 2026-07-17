<p align="center">
  <img src="landing-page/images/logo_sentinel.png" alt="Sentinela" width="180">
</p>

<h1 align="center">Sentinela</h1>
<p align="center"><em>Sistema de Gerenciamento de Parque Tecnológico Empresarial</em></p>

## Sobre o projeto

Sentinela é um sistema para controle de parque tecnológico empresarial: cadastro de empresas, filiais, departamentos, usuários, equipamentos, catálogos, manutenções e ocorrências, com dashboard de acompanhamento.

O repositório tem duas partes independentes:

```
sentinela/
├── landing-page/   site estático de apresentação (HTML/CSS/JS puro)
│   └── demo/       versão de portfólio: mesmo frontend, backend mockado em JS (sessionStorage, sem servidor)
└── sistema/        aplicação real (backend FastAPI + frontend estático + banco MySQL)
```

`landing-page/demo/` é só pra hospedagem pública: dados fictícios, login sem autenticação real, tudo reseta ao fechar a aba. O sistema de verdade (`sistema/`) roda só local, com banco MySQL.

## Stack

- **Backend:** Python 3.12, FastAPI, uvicorn
- **Banco:** MySQL (`mysql-connector-python`)
- **Auth:** JWT (`PyJWT`) + `bcrypt`
- **Frontend:** HTML/CSS/JS estático, servido pelo próprio FastAPI (mesma origem, sem CORS)

## Rodando o sistema

**1. Banco de dados**

```bash
mysql -u root -p -e "CREATE DATABASE sentinela;"
mysql -u root -p sentinela < sistema/database/schema.sql
mysql -u root -p sentinela < sistema/database/seed.sql
```

Contas de demonstração em `sistema/database/CONTAS_DEMO.md`.

Senhas do seed são hasheadas com bcrypt (custo 12) antes de entrar no `INSERT INTO usuario`. Pra gerar um novo hash:

```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'sua-senha', bcrypt.gensalt(rounds=12)).decode())"
```

**2. Variáveis de ambiente**

Copie `sistema/backend/.env.example` para `sistema/backend/.env` e ajuste `DB_USER`, `DB_PASSWORD` e `JWT_SECRET`.

**3. Backend**

```bash
cd sistema/backend
python3.12 -m venv .venv
```

Ative o ambiente virtual (varia por sistema/shell):

| Sistema | Comando |
|---|---|
| Windows (cmd) | `.venv\Scripts\activate.bat` |
| Windows (PowerShell) | `.venv\Scripts\Activate.ps1` |
| Linux / macOS | `source .venv/bin/activate` |

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Acesse `http://localhost:8000` - frontend e API (`/api/v1/...`) na mesma origem.

**4. Landing page**

Estática, sem servidor: abra `landing-page/index.html` direto no navegador.

## Sobre nós

Sentinela é um **projeto acadêmico**, Trabalho Semestral da disciplina de Banco de Dados I do curso de Ciência da Computação - FCT Unesp, Presidente Prudente, 2026.

O objetivo é exclusivamente o estudo da **modelagem e implementação de um Banco de Dados Relacional**; interface e escolhas estéticas são liberdades pessoais.

A ideia nasceu como inspiração do **BluePex Cybersecurity Framework Course** - curso em parceria entre a Unesp e a empresa BluePex Cybersecurity que capacitou os alunos a usar o ecossistema de gerenciamento de parques tecnológicos da BluePex.

**Autores:**
- Paulo Celso dos Santos Júnior — [LinkedIn](https://www.linkedin.com/in/paulocelsojunior) · [GitHub](https://github.com/Junimpsj)
- Henrique Finco Fávero — [LinkedIn](https://www.linkedin.com/in/henriquefinco)
