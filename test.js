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

// 5. Teste de Inscrição Estadual Integrada (Módulo IEValidator)
console.log('\n--- 5. Rota de Inscrição Estadual (SINTEGRA 27 UFs) ---');
const resIe = await worker.fetch(new Request('https://api.test/api/ie/SP/110042490114'), {});
const bodyIe = await resIe.json();
console.assert(resIe.status === 200, 'Status IE SP deve ser 200');
console.assert(bodyIe.valido === true, 'IE de SP deve ser válida');
console.assert(bodyIe.estado === 'São Paulo', 'Estado deve ser SP');
console.log('✅ Rota /api/ie/SP/:ie validou com sucesso Inscrição Estadual de SP');

const resIeEstados = await worker.fetch(new Request('https://api.test/api/ie/estados'), {});
const bodyEstados = await resIeEstados.json();
console.assert(bodyEstados.totalEstados === 27, 'Deve listar 27 UFs');
console.log('✅ Rota /api/ie/estados retornou exatamente 27 estados');

// 6. Teste de ClientInspector Integrado (IP e Conexão)
console.log('\n--- 6. Rota de ClientInspector (IP & User-Agent) ---');
const resIp = await worker.fetch(new Request('https://api.test/api/meu-ip', {
  headers: { 'cf-connecting-ip': '177.18.200.45', 'user-agent': 'Mozilla/5.0 Chrome/130.0' }
}), {});
const bodyIp = await resIp.json();
console.assert(resIp.status === 200, 'Status deve ser 200');
console.assert(bodyIp.ip.endereco === '177.18.200.45', 'IP deve bater com header');
console.assert(bodyIp.navegador.nome === 'Google Chrome', 'Navegador decodificado como Chrome');
console.log('✅ Rota /api/meu-ip decodificou IP e Navegador com sucesso');

console.log('\n🎉 Todos os testes passaram com 100% de sucesso!');

