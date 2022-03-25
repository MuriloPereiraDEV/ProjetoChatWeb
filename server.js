/*!!!!!!!!!!!!GRANDE IMPORTÂNCIA LER AS INSTRUÇÕES SEGUINTES!!!!!!!!!!!! */

/* Todo comentário que foi feito nesse programa está se referindo as instruções a baixo dele!!!!!! */
/* Para executar o programa só é necessario colocar o comando "node server.js" no prompt de comando que o 
servidor e paginas ficaram online!!!*/ 
/* Para abrir as paginas na web so precisa escrever "localhost:5050" */

const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


//Renderiza a pagina HTML onde recebera o nome do usuário.
app.use('/', (req, res) => {
    res.render('telalogin.html');
});

//Criando vetor que armazena os nomes de usuários que foram informados
//e o vetor de mensagens que guardará as mensagens, quem enviou e quando
//foi enviado.
var nomes = [];
var mensagens = [];

//Criação de variavel que ajudará na validação dos nomes de usuários.
var nomeRepetido = false;
nomes.push("");


//Conexão do socket e começamdo a chamar os processos.
io.on('connection', socket => {
    console.log(`Nova conexao`);

    //Socket que fica esperando ser chamado e ajudar no cadastramento
    //de usuários.
    socket.on('cadastraNome', data => {
        //Faz a validação dos nomes, se é repetido ou se nao esta em branco.
        for(var i = 0; i < nomes.length; i++){
            if(data==nomes[i]){
                nomeRepetido=true;
            }
        }
        if(nomeRepetido==false){
            nomes.push(data);
            //Caso o nome não seja repetido esse socket manda um sinal chamando
            //a proxima pagina que contem o chat.
            socket.emit('entraChat');
        }
        if(nomeRepetido){
            nomeRepetido=false;
            //Quando o nome é repetido ou esta em branco ele emite um sinal
            //que mostrara um erro na tela do usuários, pedindo outra entrada.
            socket.emit('nomeRepetido', data);
        }
    });
    
    //Aqui o socket emite um sinal para mostrar todas as mensagens que já foram 
    //enviadas para um novo usuário que entrou depois no chat.
    socket.emit('previousMessages', mensagens);

    var aux = nomes.length;
    //Pega nome armazenado e manda para o socket que estiver ouvindo essa função.
    socket.emit('pegaNome', nomes[aux-1]);

    //Envia a mensagem.
    socket.on('sendMessage', data => {
        //A mensagem é adicionada no vetor de mensagens, adicionada no banco de dados.
        mensagens.push(data);
        //Esse socket faz com que todos os usários conectados recebam a mensagem.
        socket.broadcast.emit('receivedMessage', data);
    });

    //Aqui ocorrerá a exclusão de algum usuário do vetor quando alguem fizer logout
    //do programa.
    socket.on('excluiNome', data=>{
        var i=0;
        while(data != nomes[i]){
            i++;
        }
        nomes.splice(i,1);
    });
});


server.listen(5050);