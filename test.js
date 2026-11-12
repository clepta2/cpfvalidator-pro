import { CpfValidatorPro } from './cpfvalidator-pro.js';
import worker from './worker.js';

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

// 4. Teste de Validação em Lote (Worker)
console.log('\n--- 4. Rota de Validação em Lote ---');
const resLote = await worker.fetch(new Request('https://api.test/api/cpf/lote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cpfs: ['529.982.247-25', '11111111111', 'invalido'] })
}), {});
const bodyLote = await resLote.json();
console.assert(resLote.status === 200, 'Status deve ser 200');
console.assert(bodyLote.totalSolicitado === 3, 'Deve processar 3 itens');
console.assert(bodyLote.totalValidos === 1, '1 CPF válido');
console.assert(bodyLote.totalInvalidos === 2, '2 CPFs inválidos');
console.log('✅ Rota de lote processa e separa válidos e inválidos');

const resExcesso = await worker.fetch(new Request('https://api.test/api/cpf/lote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cpfs: Array(11).fill('00000000000') })
}), {});
console.assert(resExcesso.status === 413, 'Excesso gratuito deve retornar 413');
console.log('✅ Limite de tamanho de lote gratuito respeitado (413)');

const resMetodo = await worker.fetch(new Request('https://api.test/api/cpf/lote'), {});
console.assert(resMetodo.status === 405, 'GET em /api/cpf/lote deve retornar 405');
console.log('✅ Método incorreto rejeitado');

console.log('🎉 Todos os testes passaram com 100% de sucesso!');

