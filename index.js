// Importar as dependências
const express = require('express');
const app = express();
const { redirect } = require('express/lib/response')
const bodyParser = require('body-parser');

// Configura o motor de visualização EJS
app.set('view engine', 'ejs');

// Middleware para analisar corpos de solicitação
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware que serve os arquivos estáticos para o Express
app.use(express.static('public'));

// Variável da mensagem de possíveis erros
let mensagem = null;

// Array de objetos contendo os dados dos usuários
let users = [
    {nome: 'Lorena', email: 'lorena@gmail.com', cpf: '12356344331', dataNasc: "30/01/1993", sexo: 'Feminino', estadoCivil: 'Solteiro', rendaMensal: 2000.85, logradouro: 'Rua da Torcida', estado: 'Alagoas', cidade: 'Pilar', numero: 202, complemento: 'Casa'},
    {nome: 'Mychael', email: 'mychael@gmail.com', cpf: '98732145603', dataNasc: "14/05/2002", sexo: 'Masculino', estadoCivil: 'Casado', rendaMensal: 1500.00, logradouro: 'Rua da Fiel', estado: 'Rio de Janeiro', cidade: 'Rio de Janeiro', numero: 165, complemento: 'Casa'},
    {nome: 'Maria', email: 'maria@gmail.com', cpf: '90345214392', dataNasc: "16/07/1995", sexo: 'Feminino', estadoCivil: 'Solteiro', rendaMensal: 5000.00, logradouro: 'Rua do Corinthians', estado: 'São Paulo', cidade: 'São Paulo', numero: 892, complemento: 'Casa'}
];

// Array contendo todos os estados brasileiros
const estadosBrasil = ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", 
"Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"];

// Array de opções de estado civil
const estadosCivis = ["Solteiro(a)", "Casado(a)", "Separado(a)", "Divorciado(a)", "Viúvo(a)"];
// Rota para a página inicial
app.get('/', (req, res) => {
    res.render('users', { users });
});

// Rota para abrir a página de registro de usuário
app.get('/register', (req, res) => {
    res.render('register', { mensagem: mensagem || {} });
    mensagem = null;
});

// Rota para deletar o usuário
app.get('/delete/:email', (req, res) => {
    let email = req.params.email;
    // Criando um novo array sem o usuário a ser deletado com o uso do filter
    for (let i = 0; i < users.length; i++){
        if (email == users[i].email){
            users = users.filter((x) => x.email != email);
        }
    }
    res.render('users', { users }); // Recarrega a página com a nova lista de usuários
});

// Rota para processar o envio dos dados de registro
app.post('/register', (req, res) => {
    let { nome, email, cpf, dataNasc, sexo, estadoCivil, rendaMensal, logradouro, estado, cidade, numero, complemento } = req.body;
    mensagem = {};

    // Verifica se algum usuário com o mesmo email e cpf já está cadastrado.
    let usuario1 = users.some(user => user.email === email);
    let usuario2 = users.some(user => user.cpf === cpf);

    // Se o usuário já estiver cadastrado, a URL é retornada com uma mensagem indicando o ato.
    if (usuario1 ) {
        return res.redirect('/register?error=Este usuário já está cadastrado.');
    }

    if (usuario2) {
        return res.redirect('/register?error=Este usuário já está cadastrado.');
    }

    // Valida se os campos obrigatórios não estão preenchidos
    if (!nome || !cpf || !dataNasc || !sexo || !rendaMensal || !logradouro || !cidade || !numero || !complemento) {
        mensagem.geral = "Este campo é requerido.";
        return res.redirect('/register');
    }
    
    // Verifica se os campos de nome, logradouro e cidade têm o mínimo de 3 caracteres.
    if(nome.length < 3) {
        mensagem.nome = "O nome deve atender ao mínimo de 3 caracteres.";
        return res.redirect('/register');
    } 
    
    if(logradouro.length < 3) {
        mensagem.logradouro = "O logradouro deve atender ao mínimo de 3 caracteres.";
        return res.redirect('/register');
    } 
    
    if(cidade.length < 3){
        mensagem.cidade = "O nome da cidade deve atender ao mínimo de 3 caracteres.";
        return res.redirect('/register');
    }

    // Verifica o CPF
    const regexCPF = /^\d{11}$/;
    if (regexCPF.test(cpf) && cpf.toString().length === 11) {
        let iguais = true;
        // Verifica se todos os digitos não são iguais
        for (let i = 0; i < cpf.length; i++) {
            if (cpf[i] !== cpf[0]) {
                iguais = false;
            }
        }
        // Se forem iguais, o erro é "tratado".
        if (iguais) {
            mensagem.cpf = "CPF inválido";
            return res.redirect('/register');
        }
    } else {
        mensagem.cpf = "CPF inválido";
        return res.render('register');
    }

    // Verifica se o estado civil é inválido
    if (!estadosCivis.includes(estadoCivil)) {
        return res.render('register');
    }

    // Verifica se o estado do Brasil é inválido
    if (!estadosBrasil.includes(estado)) {
        return res.render('register');
    }

    // Verifica se a data é inválida
    if ((new Date(dataNasc)) >= (new Date())) {
        mensagem.data = 'Data de nascimento inválida!';
        return res.redirect('/register');
    } else {
        const data = new Date(dataNasc);
        data.setDate(data.getDate() + 1); // Aumenta o dia em 1
        const formattedDate = data.toLocaleDateString('pt-BR');
        dataNasc = formattedDate;  
    }

    // Verifica se a renda mensal é um número, e, e se após os separadores há dígitos
    const regexRenda = /^\d{1,3}(?:\.\d{3})*(,\d{2})$/;
    if (!regexRenda.test(rendaMensal)) {
        mensagem.renda = "Renda mensal inválida!";
        return res.redirect('/register');
    }

    // Verifica se o dado do campo número não é um número e se não é um inteiro.
    if (isNaN(numero)) {
        mensagem.numero = 'O campo de número aceita apenas números inteiros!';
        return res.redirect('/register');
    }
    
    // Se todas as validações passarem, adiciona os valores dos inputs a um objeto de usuários
        let novoUsuario = {
            nome: nome,
            email: email, 
            cpf: cpf, 
            dataNasc: dataNasc, 
            sexo: sexo, 
            estadoCivil: estadoCivil, 
            rendaMensal: rendaMensal, 
            logradouro: logradouro, 
            estado: estado, 
            cidade: cidade, 
            numero: numero, 
            complemento: complemento
        };
        
        // Adiciona o novo usuário à lista de usuários
        users.push(novoUsuario);
        
        // Redireciona para a página de cadastramento com sucesso!
        res.render('success');
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
