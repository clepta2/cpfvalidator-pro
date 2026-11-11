# ??? CpfValidator Pro ? SDK & Documenta??o de Integra??o

> **Cliente SDK e Documenta??o Oficial de Integra??o da API CpfValidator Pro.**  
> ?? **Aten??o:** Este reposit?rio destina-se exclusivamente ? visualiza??o de documenta??o t?cnica e integra??o do cliente SDK. O servi?o de API em nuvem ? operado atrav?s do nosso **Site de APIs (em breve)**. O acesso aos endpoints na borda requer obrigatoriamente uma **Chave de API (`x-api-key`)** ativa.

[![Status](https://img.shields.io/badge/Status-Cloudflare%20Edge%20API-success.svg)](#)
[![Algoritmo](https://img.shields.io/badge/Algoritmo-M?dulo%2011%20Oficial-blue.svg)](#)
[![Autentica??o](https://img.shields.io/badge/Autentica??o-x--api--key%20Obrigat?ria-orange.svg)](#)
[![License: Proprietary](https://img.shields.io/badge/License-Propriet?ria%20%2F%20Portal%20de%20APIs-red.svg)](LICENSE)

---

> ?? **Acesso Oficial & Chaves de API**:  
> O acesso em produ??o a este microsservi?o ? disponibilizado e monitorado exclusivamente atrav?s do nosso **Site de APIs (em breve no ar)**.  
> Para obter sua chave de acesso (`x-api-key`), contratar cotas de requisi??es e testar ao vivo, realize o cadastro em nossa plataforma de APIs.

---

## ? O que ? o CpfValidator Pro?

O **CpfValidator Pro** ? uma solu??o de infraestrutura leve desenvolvida para eliminar entradas inv?lidas de CPF em:
- **Sistemas de Checkout & E-commerce**
- **Plataformas de Onboarding & KYC**
- **ERPs e Faturamento Fiscal (NFC-e / NF-e)**
- **Bots de Atendimento WhatsApp**

A valida??o pode ser executada **100% localmente no cliente em mem?ria RAM (0ms I/O)** ou atrav?s da **API Oficial na nuvem**.

---

## ?? Como Integrar em seu Projeto

### 1. Instala??o

```bash
npm install cpfvalidator-pro
```

*(Ou utilize o arquivo `cpfvalidator-pro.js` diretamente no seu frontend ou backend Node.js)*.

### 2. Uso R?pido com o SDK (Local em RAM - 0ms de Rede)

```javascript
import { CpfValidatorPro } from 'cpfvalidator-pro';

// Valida??o matem?tica instant?nea sem chamada de rede (custo ZERO de requisi??es)
const resultado = CpfValidatorPro.validarLocal('529.982.247-25');

console.log(resultado.valido); // true
console.log(resultado.regiaoFiscal.estados); // ['ES', 'RJ']
console.log(resultado.cpf); // '529.982.247-25'
```

### 3. Chamada via Edge API Oficial (Requer x-api-key)

```javascript
const api = new CpfValidatorPro({
  apiKey: 'SUA_CHAVE_DO_PORTAL' // Obtenha no Site de APIs
});
const res = await api.validar('52998224725');
console.log(res);
```

### 4. Exemplos de Chamadas HTTP Diretas (Curl)

```bash
# Valida??o oficial (Requer x-api-key)
curl -X GET "https://ponte.ozpro.com.br/api/validar-cpf?cpf=529.982.247-25" \
  -H "x-api-key: SUA_CHAVE_DO_PORTAL"

# Via Path Parameter
curl -X GET "https://ponte.ozpro.com.br/api/cpf/52998224725" \
  -H "x-api-key: SUA_CHAVE_DO_PORTAL"
```

---

## ?? Licen?a

Distribu?do sob termos propriet?rios. Veja `LICENSE` para mais detalhes.

Copyright (c) 2026 clepta2
