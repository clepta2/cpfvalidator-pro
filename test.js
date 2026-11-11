import { CpfValidatorPro } from './cpfvalidator-pro.js';

console.log('🧪 Testando CpfValidatorPro SDK...');

// 1. Teste de CPF válido
const v1 = CpfValidatorPro.validarLocal('529.982.247-25');
console.assert(v1.valido === true, 'v1 deve ser válido');
console.assert(v1.regiaoFiscal.estados.includes('RJ'), 'v1 deve ser do RJ/ES');
console.log('✅ Validação válida OK:', v1.cpf, v1.regiaoFiscal.estados);

// 2. Teste de CPF com dígitos repetidos
const v2 = CpfValidatorPro.validarLocal('11111111111');
console.assert(v2.valido === false, 'v2 deve ser falso');
console.log('✅ Rejeição de repetidos OK:', v2.motivo);

// 3. Teste do gerador
const gerado = CpfValidatorPro.gerarTeste(8); // Região 8 = SP
const vGerado = CpfValidatorPro.validarLocal(gerado);
console.assert(vGerado.valido === true, 'CPF gerado deve ser válido');
console.assert(vGerado.regiaoFiscal.estados.includes('SP'), 'CPF gerado deve ser de SP');
console.log('✅ Gerador de CPF válido OK:', gerado, vGerado.regiaoFiscal.estados);

console.log('🎉 Todos os testes do SDK passaram!');
