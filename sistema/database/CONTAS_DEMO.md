# Contas demo — Sentinela

Senhas em texto plano só existem aqui, nunca no banco (coluna `usuario.senha` guarda
hash bcrypt custo 12). Todos os emails abaixo funcionam imediatamente após rodar
`schema.sql` + `seed.sql`. Senha é sempre a mesma por papel: `dono123` / `admin123` / `colab123`.

## Empresa 1 — TechCorp Soluções Ltda (TI/consultoria)

| Email | Senha | Papel | Escopo |
|---|---|---|---|
| marcos.andrade@techcorp.com.br | dono123 | dono_empresa | Toda a empresa (3 filiais: Presidente Prudente, Assis, São Paulo) |
| fernanda.lima@techcorp.com.br | admin123 | admin_filial | Filial Presidente Prudente (TI, Financeiro, RH, Comercial, Segurança da Informação) |
| joao.pereira@techcorp.com.br | colab123 | colaborador | Depto TI — Presidente Prudente |
| carla.souza@techcorp.com.br | colab123 | colaborador | Depto Financeiro — Presidente Prudente |
| roberto.dias@techcorp.com.br | admin123 | admin_filial | Filial Assis (TI, Comercial, Vendas, Suporte ao Cliente, Marketing) |
| diego.martins@techcorp.com.br | colab123 | colaborador | Depto TI — Assis |
| beatriz.nogueira@techcorp.com.br | colab123 | colaborador | Depto Suporte ao Cliente — Assis |
| camila.rezende@techcorp.com.br | admin123 | admin_filial | Filial São Paulo (TI, Marketing, Jurídico, Financeiro, P&D, Segurança da Informação) |
| thiago.almeida@techcorp.com.br | colab123 | colaborador | Depto TI — São Paulo |
| larissa.prado@techcorp.com.br | colab123 | colaborador | Depto Marketing — São Paulo |

## Empresa 2 — Meridian Sistemas Ltda (desenvolvimento de software/ERP)

| Email | Senha | Papel | Escopo |
|---|---|---|---|
| ricardo.alves@meridian.com.br | dono123 | dono_empresa | Toda a empresa (2 filiais: Cascavel, Foz do Iguaçu) |
| patricia.gomes@meridian.com.br | admin123 | admin_filial | Filial Cascavel (TI, Comercial, Suporte, Desenvolvimento, QA/Testes) |
| bruno.costa@meridian.com.br | colab123 | colaborador | Depto TI — Cascavel |
| juliana.ramos@meridian.com.br | colab123 | colaborador | Depto Suporte — Cascavel |
| eduardo.nunes@meridian.com.br | admin123 | admin_filial | Filial Foz do Iguaçu (TI, Infraestrutura, Financeiro, Atendimento, Administrativo) |
| felipe.rocha@meridian.com.br | colab123 | colaborador | Depto TI — Foz do Iguaçu |
| vanessa.teixeira@meridian.com.br | colab123 | colaborador | Depto Atendimento — Foz do Iguaçu |

## Empresa 3 — Vórtice Indústria e Logística S.A. (manufatura/logística)

| Email | Senha | Papel | Escopo |
|---|---|---|---|
| aline.barbosa@vortice.com.br | dono123 | dono_empresa | Toda a empresa (2 filiais: Campinas, Ribeirão Preto) |
| rodrigo.castro@vortice.com.br | admin123 | admin_filial | Filial Campinas (TI, Produção, Qualidade, Manutenção Industrial, Almoxarifado, Segurança do Trabalho) |
| gustavo.pires@vortice.com.br | colab123 | colaborador | Depto TI — Campinas |
| renata.farias@vortice.com.br | colab123 | colaborador | Depto Produção — Campinas |
| simone.ferreira@vortice.com.br | admin123 | admin_filial | Filial Ribeirão Preto (TI, Expedição, Compras, Logística, Administrativo) |
| lucas.monteiro@vortice.com.br | colab123 | colaborador | Depto TI — Ribeirão Preto |
| priscila.duarte@vortice.com.br | colab123 | colaborador | Depto Compras — Ribeirão Preto |

## Uso nos testes de isolamento multi-tenant (seção 3.3 do prompt)

- Qualquer conta da Empresa 1 vs Empresa 2 vs Empresa 3 → nunca devem enxergar dados umas das outras.
- `fernanda.lima` (Presidente Prudente) vs `roberto.dias` (Assis) vs `camila.rezende` (São Paulo) →
  mesma empresa, filiais diferentes, não devem se enxergar.
- `joao.pereira` (TI) vs `carla.souza` (Financeiro), ambos em Presidente Prudente → mesma filial,
  departamentos diferentes, não devem se enxergar.
