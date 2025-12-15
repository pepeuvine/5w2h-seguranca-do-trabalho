// --- VARIÁVEIS GLOBAIS ---

// Controla o índice das linhas. Começa com 5 pois o HTML inicial já tem 5 linhas (indices 0 a 4).
let totalLinhas = 5;

// Definição das colunas
const colunasPlanilha = [
    { chave: 'what', titulo: 'O QUE?', subtitulo: 'WHAT' },
    { chave: 'why', titulo: 'POR QUE?', subtitulo: 'WHY' },
    { chave: 'where', titulo: 'ONDE?', subtitulo: 'WHERE' },
    { chave: 'who', titulo: 'QUEM?', subtitulo: 'WHO' },
    { chave: 'when', titulo: 'QUANDO?', subtitulo: 'WHEN' },
    { chave: 'how', titulo: 'COMO?', subtitulo: 'HOW' },
    { chave: 'howMuch', titulo: 'QUANTO?', subtitulo: 'HOW MUCH' },
    { chave: 'status', titulo: 'STATUS', subtitulo: '' }
];

/**
 * Adiciona UMA nova linha ao final da tabela
 */
window.adicionarLinha = function() {
    const tbody = document.querySelector('.planilha-table tbody');
    
    // O índice da nova linha será igual ao total atual
    const index = totalLinhas;
    
    const novaLinhaHTML = `
        <tr>
            <td><textarea name="what_${index}" placeholder="O que será feito?"></textarea></td>
            <td><textarea name="why_${index}" placeholder="Por que isso é necessário? Qual o objetivo?"></textarea></td>
            <td><textarea name="where_${index}" placeholder="Onde a ação será realizada?"></textarea></td>
            <td><textarea name="who_${index}" placeholder="Quem será o responsável por cada parte?"></textarea></td>
            <td><textarea name="when_${index}" placeholder="Quando será feito? Qual o prazo ou data?"></textarea></td>
            <td><textarea name="how_${index}" placeholder="Como a ação será executada? Quais os passos?"></textarea></td>
            <td><textarea name="howMuch_${index}" placeholder="Quanto custará? Qual o investimento?"></textarea></td>
            <td>
                <select name="status_${index}">
                    <option value="">Selecione</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                </select>
            </td>
        </tr>
    `;

    // Insere o novo HTML no final do corpo da tabela
    tbody.insertAdjacentHTML('beforeend', novaLinhaHTML);
    
    // Incrementa o contador
    totalLinhas++;
};

/**
 * Remove a ÚLTIMA linha da tabela
 */
window.removerLinha = function() {
    // Impede que o usuário remova todas as linhas (mantém pelo menos 1)
    if (totalLinhas <= 1) {
        alert("É necessário manter pelo menos uma linha no plano de ação.");
        return;
    }

    const tbody = document.querySelector('.planilha-table tbody');
    
    // Remove o último filho (a última tr) do tbody
    if (tbody.lastElementChild) {
        tbody.removeChild(tbody.lastElementChild);
        totalLinhas--; // Decrementa o contador
    }
};

// --- INICIALIZAÇÃO E LÓGICA DO PDF ---
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('form5w2h');
    const botaoGerarPdf = document.getElementById('generatePdf');

    /**
     * Coleta dados do formulário baseado no total de linhas atual
     */
    function coletarDadosFormulario() {
        const dadosFormulario = {};
        const elementosFormulario = formulario.elements;
        
        const campoResponsavel = document.getElementById('responsavel');
        const campoArea = document.getElementById('area');
        dadosFormulario.responsavel = campoResponsavel ? campoResponsavel.value.trim() : '';
        dadosFormulario.area = campoArea ? campoArea.value.trim() : '';
        
        dadosFormulario.linhas = [];
        
        // Itera até o número atual de linhas
        for (let i = 0; i < totalLinhas; i++) {
            const linha = {};
            let linhaTemDados = false;
            
            colunasPlanilha.forEach(coluna => {
                const nomeCampo = `${coluna.chave}_${i}`;
                const elemento = elementosFormulario[nomeCampo];
                const valor = elemento ? elemento.value.trim() : '';
                linha[coluna.chave] = valor;
                
                if (valor && valor !== '') {
                    linhaTemDados = true;
                }
            });
            
            if (linhaTemDados) {
                dadosFormulario.linhas.push(linha);
            }
        }
        
        return dadosFormulario;
    }

    function possuiDados(dadosFormulario) {
        return dadosFormulario.linhas && dadosFormulario.linhas.length > 0;
    }

    // --- FUNÇÕES DE DESENHO DO PDF (Mantidas do original) ---

    function configurarCabecalhoPdf(documento, larguraPagina, margem, responsavel, area) {
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        let posicaoY = margem;
        documento.setFontSize(16);
        documento.setFont('helvetica', 'bold');
        documento.setTextColor(26, 26, 26);
        documento.text('Plano de Ação 5W2H', margem, posicaoY);

        documento.setFontSize(9);
        documento.setFont('helvetica', 'normal');
        documento.setTextColor(42, 42, 42);
        
        let posicaoXInfo = larguraPagina - margem;
        let textosInfo = [];
        if (responsavel) textosInfo.push(`Responsável: ${responsavel}`);
        if (area) textosInfo.push(`Área: ${area}`);

        textosInfo.forEach((texto) => {
            const larguraTexto = documento.getTextWidth(texto);
            documento.text(texto, posicaoXInfo - larguraTexto, posicaoY);
            posicaoXInfo -= larguraTexto + 20;
        });
        posicaoY += 10;
        documento.setFontSize(8);
        documento.setTextColor(122, 122, 122);
        documento.text(`Gerado em: ${dataFormatada}`, margem, posicaoY);
        return posicaoY + 12;
    }

    function desenharCabecalhoTabela(documento, posicaoY, larguraPagina, margem, larguraColuna, alturaCabecalho) {
        let posicaoX = margem;
        const topoCabecalho = posicaoY - alturaCabecalho;
        documento.setFillColor(26, 26, 26);
        documento.rect(posicaoX, topoCabecalho, larguraPagina - (margem * 2), alturaCabecalho, 'F');
        documento.setDrawColor(10, 10, 10);
        documento.setLineWidth(0.3);
        documento.setTextColor(255, 255, 255); 
        
        colunasPlanilha.forEach((coluna, index) => {
            const x = posicaoX + (index * larguraColuna);
            const centroX = x + (larguraColuna / 2);
            if (index > 0) documento.line(x, topoCabecalho, x, posicaoY);
            
            const centroY = topoCabecalho + (alturaCabecalho / 2);
            documento.setFontSize(8);
            documento.setFont('helvetica', 'bold');
            
            if (coluna.subtitulo) {
                documento.text(coluna.titulo, centroX, centroY - 2.5, { align: 'center' });
                documento.setFontSize(6);
                documento.setFont('helvetica', 'normal');
                documento.text(coluna.subtitulo, centroX, centroY + 4.5, { align: 'center' });
            } else {
                documento.text(coluna.titulo, centroX, centroY + 2, { align: 'center' });
            }
        });
        documento.line(posicaoX + (colunasPlanilha.length * larguraColuna), topoCabecalho, posicaoX + (colunasPlanilha.length * larguraColuna), posicaoY);
        return posicaoY;
    }

    function desenharCelula(documento, conteudo, x, y, largura, altura) {
        documento.setFillColor(255, 255, 255);
        documento.rect(x, y, largura, altura, 'F');
        documento.setDrawColor(224, 224, 224);
        documento.setLineWidth(0.2);
        documento.rect(x, y, largura, altura);
        
        if (conteudo) {
            documento.setFontSize(7);
            documento.setFont('helvetica', 'normal');
            documento.setTextColor(26, 26, 26);
            const linhas = documento.splitTextToSize(conteudo, largura - 4);
            const alturaLinha = 4;
            linhas.forEach((linha, index) => {
                if ((index * alturaLinha) + 2 < altura - 2) {
                    documento.text(linha, x + 2, y + 2 + (index * alturaLinha) + 3, { maxWidth: largura - 4 });
                }
            });
        }
    }

    function desenharLinhaDados(documento, linhaDados, posicaoY, larguraPagina, margem, larguraColuna, alturaLinha) {
        let posicaoX = margem;
        colunasPlanilha.forEach((coluna, index) => {
            const x = posicaoX + (index * larguraColuna);
            desenharCelula(documento, linhaDados[coluna.chave] || '', x, posicaoY, larguraColuna, alturaLinha);
        });
        return posicaoY + alturaLinha;
    }

    function desenharRodapePdf(documento, larguraPagina, alturaPagina, margem) {
        const alturaRodape = 80;
        const posicaoYRodape = alturaPagina - alturaRodape - margem;
        
        documento.setFontSize(7);
        documento.setFont('helvetica', 'normal');
        documento.setTextColor(90, 90, 90);
        
        let posicaoY = posicaoYRodape;
        
        documento.text('© 2025 Plano de Ação 5W2H', larguraPagina / 2, posicaoY, { align: 'center' });
        posicaoY += 8;
        
        documento.setDrawColor(224, 224, 224);
        documento.setLineWidth(0.3);
        documento.line(margem + 50, posicaoY, larguraPagina - margem - 50, posicaoY);
        posicaoY += 10;
        
        documento.setFontSize(6.5);
        documento.setTextColor(42, 42, 42);
        documento.text('Desenvolvido por acadêmicos de Engenharia da Computação - IFMA na disciplina de Segurança do Trabalho e Ergonomia:', larguraPagina / 2, posicaoY, { align: 'center', maxWidth: larguraPagina - (margem * 2) - 100 });
        posicaoY += 10;
        
        documento.setFontSize(6);
        documento.setTextColor(58, 58, 58);
        
        const nomesColuna1 = [
            'Pedro Vinicius Prado do Nascimento',
            'Carlos Eduardo Santos de Lima',
            'Sávio Daniel Matos Marinho'
        ];
        
        const nomesColuna2 = [
            'Gustavo Ribeiro Lobato',
            'Luiz Felipe Miranda Freitas',
            'José Luiz Silva Farias'
        ];
        
        const larguraColuna = 180;
        const distanciaCentro = 120; 
        const centroPagina = larguraPagina / 2;
        const posicaoXCol1 = centroPagina - distanciaCentro;
        const posicaoXCol2 = centroPagina + distanciaCentro;
        
        nomesColuna1.forEach((nome, index) => {
            documento.text(nome, posicaoXCol1, posicaoY + (index * 6), { align: 'center', maxWidth: larguraColuna });
        });
        
        nomesColuna2.forEach((nome, index) => {
            documento.text(nome, posicaoXCol2, posicaoY + (index * 6), { align: 'center', maxWidth: larguraColuna });
        });
        
        posicaoY += 22;
        
        documento.setFontSize(5.5);
        documento.setTextColor(138, 138, 138);
        documento.text('Orientador: Lindemberg Alex Pereira Trindade', larguraPagina / 2, posicaoY, { align: 'center' });
    }

    function gerarPdf() {
        const dadosFormulario = coletarDadosFormulario();
        
        if (!possuiDados(dadosFormulario)) {
            alert('Por favor, preencha pelo menos um campo antes de gerar o relatório.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const documento = new jsPDF('landscape', 'pt', 'a4');
        
        const larguraPagina = documento.internal.pageSize.getWidth();
        const alturaPagina = documento.internal.pageSize.getHeight();
        const margem = 20;
        const larguraUtil = larguraPagina - (margem * 2);
        const larguraColuna = larguraUtil / colunasPlanilha.length;
        const alturaCabecalho = 18;
        const alturaLinha = 50;

        let posicaoY = configurarCabecalhoPdf(documento, larguraPagina, margem, dadosFormulario.responsavel, dadosFormulario.area);
        posicaoY = desenharCabecalhoTabela(documento, posicaoY, larguraPagina, margem, larguraColuna, alturaCabecalho);

        dadosFormulario.linhas.forEach((linha, index) => {
            if (posicaoY + alturaLinha > alturaPagina - 100) {
                desenharRodapePdf(documento, larguraPagina, alturaPagina, margem);
                documento.addPage();
                posicaoY = margem;
                posicaoY = configurarCabecalhoPdf(documento, larguraPagina, margem, dadosFormulario.responsavel, dadosFormulario.area);
                posicaoY = desenharCabecalhoTabela(documento, posicaoY, larguraPagina, margem, larguraColuna, alturaCabecalho);
            }
            posicaoY = desenharLinhaDados(documento, linha, posicaoY, larguraPagina, margem, larguraColuna, alturaLinha);
        });

        desenharRodapePdf(documento, larguraPagina, alturaPagina, margem);

        const dataAtual = new Date();
        const nomeArquivo = `Plano_Acão_5W2H_${dataAtual.toISOString().split('T')[0]}.pdf`;
        documento.save(nomeArquivo);
    }

    if(botaoGerarPdf) {
        botaoGerarPdf.addEventListener('click', gerarPdf);
    }
});