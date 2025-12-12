/**
 * Script principal para o formulário 5W2H
 */

document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('form5w2h');
    const botaoGerarPdf = document.getElementById('generatePdf');

    const numeroLinhas = 5;

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
     * Coleta todos os dados preenchidos no formulário de todas as linhas
     * @returns {Object} Objeto com as respostas do formulário e informações do cabeçalho
     */
    function coletarDadosFormulario() {
        const dadosFormulario = {};
        const elementosFormulario = formulario.elements;
        
        const campoResponsavel = document.getElementById('responsavel');
        const campoArea = document.getElementById('area');
        dadosFormulario.responsavel = campoResponsavel ? campoResponsavel.value.trim() : '';
        dadosFormulario.area = campoArea ? campoArea.value.trim() : '';
        
        dadosFormulario.linhas = [];
        
        for (let i = 0; i < numeroLinhas; i++) {
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

    /**
     * Verifica se há pelo menos um campo preenchido no formulário
     * @param {Object} dadosFormulario - Dados coletados do formulário
     * @returns {boolean} True se houver dados, False caso contrário
     */
    function possuiDados(dadosFormulario) {
        return dadosFormulario.linhas && dadosFormulario.linhas.length > 0;
    }

    /**
     * Configura o cabeçalho do PDF (título, responsável, área e data)
     * @param {Object} documento - Instância do jsPDF
     * @param {number} larguraPagina - Largura da página em pontos
     * @param {number} margem - Margem lateral em pontos
     * @param {string} responsavel - Nome do responsável
     * @param {string} area - Área/Departamento
     * @returns {number} Posição Y após o cabeçalho
     */
    function configurarCabecalhoPdf(documento, larguraPagina, margem, responsavel, area) {
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
        
        if (responsavel && responsavel.trim() !== '') {
            textosInfo.push(`Responsável: ${responsavel}`);
        }
        if (area && area.trim() !== '') {
            textosInfo.push(`Área: ${area}`);
        }

        textosInfo.forEach((texto) => {
            const larguraTexto = documento.getTextWidth(texto);
            documento.text(texto, posicaoXInfo - larguraTexto, posicaoY);
            posicaoXInfo -= larguraTexto + 20;
        });
        
        posicaoY += 10;

        documento.setFontSize(8);
        documento.setTextColor(122, 122, 122);
        documento.text(`Gerado em: ${dataFormatada}`, margem, posicaoY);
        posicaoY += 12;

        return posicaoY;
    }

    /**
     * Desenha o cabeçalho da tabela no PDF
     * @param {Object} documento - Instância do jsPDF
     * @param {number} posicaoY - Posição vertical atual
     * @param {number} larguraPagina - Largura da página
     * @param {number} margem - Margem lateral
     * @param {number} larguraColuna - Largura de cada coluna
     * @param {number} alturaCabecalho - Altura do cabeçalho
     * @returns {number} Nova posição Y após o cabeçalho
     */
    function desenharCabecalhoTabela(documento, posicaoY, larguraPagina, margem, larguraColuna, alturaCabecalho) {
        let posicaoX = margem;
        const topoCabecalho = posicaoY - alturaCabecalho;
        
        documento.setFillColor(26, 26, 26); // preto 
        documento.rect(posicaoX, topoCabecalho, larguraPagina - (margem * 2), alturaCabecalho, 'F');
        
        //bordas das colunas
        documento.setDrawColor(10, 10, 10); // preto mais escuro para bordas
        documento.setLineWidth(0.3);
        
        documento.setTextColor(255, 255, 255); 
        
        colunasPlanilha.forEach((coluna, index) => {
            const x = posicaoX + (index * larguraColuna);
            const centroX = x + (larguraColuna / 2);
            
            //borda vertical
            if (index > 0) {
                documento.line(x, topoCabecalho, x, posicaoY);
            }
            
            const centroY = topoCabecalho + (alturaCabecalho / 2);
            
            documento.setFontSize(8);
            documento.setFont('helvetica', 'bold');
            
            if (coluna.subtitulo) {
                const offsetTitulo = 2.5;
                const offsetSubtitulo = 4.5;
                documento.text(coluna.titulo, centroX, centroY - offsetTitulo, { align: 'center' });
                
                documento.setFontSize(6);
                documento.setFont('helvetica', 'normal');
                documento.text(coluna.subtitulo, centroX, centroY + offsetSubtitulo, { align: 'center' });
            } else {
                documento.text(coluna.titulo, centroX, centroY + 2, { align: 'center' });
            }
        });
        
        documento.line(posicaoX + (colunasPlanilha.length * larguraColuna), topoCabecalho, 
                       posicaoX + (colunasPlanilha.length * larguraColuna), posicaoY);
        
        return posicaoY;
    }

    /**
     * Desenha uma célula da tabela no PDF
     * @param {Object} documento - Instância do jsPDF
     * @param {string} conteudo - Conteúdo da célula
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {number} largura - Largura da célula
     * @param {number} altura - Altura da célula
     */
    function desenharCelula(documento, conteudo, x, y, largura, altura) {
        documento.setFillColor(255, 255, 255);
        documento.rect(x, y, largura, altura, 'F');
        
        // Borda
        documento.setDrawColor(224, 224, 224); // Cinza claro #e0e0e0
        documento.setLineWidth(0.2);
        documento.rect(x, y, largura, altura);
        
        // Texto
        if (conteudo) {
            documento.setFontSize(7);
            documento.setFont('helvetica', 'normal');
            documento.setTextColor(26, 26, 26);
            
            const linhas = documento.splitTextToSize(conteudo, largura - 4);
            const alturaLinha = 4;
            const padding = 2;
            
            linhas.forEach((linha, index) => {
                if ((index * alturaLinha) + padding < altura - 2) {
                    documento.text(linha, x + padding, y + padding + (index * alturaLinha) + 3, {
                        maxWidth: largura - (padding * 2)
                    });
                }
            });
        }
    }

    /**
     * Desenha uma linha de dados da planilha no PDF
     * @param {Object} documento - Instância do jsPDF
     * @param {Object} linhaDados - Dados de uma linha
     * @param {number} posicaoY - Posição Y inicial
     * @param {number} larguraPagina - Largura da página
     * @param {number} margem - Margem lateral
     * @param {number} larguraColuna - Largura de cada coluna
     * @param {number} alturaLinha - Altura da linha
     * @returns {number} Nova posição Y após a linha
     */
    function desenharLinhaDados(documento, linhaDados, posicaoY, larguraPagina, margem, larguraColuna, alturaLinha) {
        let posicaoX = margem;
        
        colunasPlanilha.forEach((coluna, index) => {
            const x = posicaoX + (index * larguraColuna);
            const conteudo = linhaDados[coluna.chave] || '';
            desenharCelula(documento, conteudo, x, posicaoY, larguraColuna, alturaLinha);
        });
        
        return posicaoY + alturaLinha;
    }

    /**
     * Função principal para gerar o relatório em PDF no formato de planilha
     * Coleta os dados, valida e cria o documento PDF
     */
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

        let posicaoY = configurarCabecalhoPdf(
            documento, 
            larguraPagina, 
            margem, 
            dadosFormulario.responsavel, 
            dadosFormulario.area
        );

        posicaoY = desenharCabecalhoTabela(
            documento, 
            posicaoY, 
            larguraPagina, 
            margem, 
            larguraColuna, 
            alturaCabecalho
        );

        dadosFormulario.linhas.forEach(linha => {
            if (posicaoY + alturaLinha > alturaPagina - margem) {
                documento.addPage();
                posicaoY = margem;
                
                posicaoY = configurarCabecalhoPdf(
                    documento, 
                    larguraPagina, 
                    margem, 
                    dadosFormulario.responsavel, 
                    dadosFormulario.area
                );
                
                posicaoY = desenharCabecalhoTabela(
                    documento, 
                    posicaoY, 
                    larguraPagina, 
                    margem, 
                    larguraColuna, 
                    alturaCabecalho
                );
            }
            
            posicaoY = desenharLinhaDados(
                documento,
                linha,
                posicaoY,
                larguraPagina,
                margem,
                larguraColuna,
                alturaLinha
            );
        });

        const dataAtual = new Date();
        const nomeArquivo = `Plano_Acão_5W2H_${dataAtual.toISOString().split('T')[0]}.pdf`;
        
        documento.save(nomeArquivo);
    }

    botaoGerarPdf.addEventListener('click', gerarPdf);
});
