import express from 'express';
import bodyParser from 'body-parser'
import axios from 'axios';

import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from 'cookie-parser';
import hateoasLinker from "express-hateoas-links";
// const hateoasLinker = require("express-hateoas-links");
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';



const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Gateway",
            version: "1.0.0",
            description: "API Gateway para controle de usuários e eventos do jogo.",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./index.js"], // Update with the correct filename
};
const app = express();
const port = 3000;

// swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(express.static('public', {
    index: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser())
app.use(hateoasLinker);

// constantes
const API_SOAP = "http://localhost:8000/eventos/";
const API_REST = "http://localhost:8080/users/";
const SECRET_KEY = "minhachavemuitosegurasegurademaisdescobreai"

// Middleware para verificar o token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) return res.redirect("/login");
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.redirect("/login");
    }
};


// rotas
// home
app.get("/", authenticateToken, (req, res) => {
    res.sendFile("index.html", { root: 'public' });
})

// eventos
app.get("/ranking", authenticateToken, (req, res) => {
    res.sendFile('ranking.html', { root: 'public' });
})

// enviar username para o SOAP
app.post("/tentativa", authenticateToken, async (req, res) => {
    const { palavra, acertou } = req.body;
    const username = req.user.username;
    console.log(" > " + palavra + " ");

    try {
        // aumentando o score do usuário
        if(acertou){
            const user = (await axios.get(`${API_REST+username}`)).data; // get use by username from rest api
            const score = parseInt(user.score) + 1;
            const userToPatch = {
                score: score
            }

            await axios.patch(`${API_REST}${user.id}`, userToPatch, {
                headers: {
                    "Content-Type": "application/json"
                }
            }); // get use by username from rest api
        }

        const xmlData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://src.soap/">
            <soapenv:Header/>
            <soapenv:Body>
                <soap:mensagem>
                    <arg0>${username}</arg0>
                    <arg1>${palavra}</arg1>
                    <arg2>${acertou}</arg2>
                </soap:mensagem>
            </soapenv:Body>
        </soapenv:Envelope>
        `;

        await axios.post(API_SOAP, xmlData, {
            headers: {
                'Content-Type': 'text/xml',
            }
        })

        res.json({ mensagem: "Tentativa registrada!" });
        
    } catch (err) {
        console.log(err);
    }

    // res.redirect('/eventos');
})

// cadastro render file
app.get("/cadastro", (req, res) => {
    res.sendFile('cadastro.html', { root: 'public' });
})

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de users retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: rBendelack
 *                   score:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Erro interno do servidor
 */
app.get("/users", async (req, res) => {
    try {
        const response = await axios.get(`${API_REST}`);

        if(response.status === 200){
            const users = response.data.map((user) => ({
                "id": user.id,
                "username": user.username,
                "score": user.score,
                links: [
                    { rel: 'self', method: 'GET', href: `/users/${user.id}` },
                    { rel: 'update', method: 'PATCH', href: `/users/${user.id}` },
                    { rel: 'delete', method: 'DELETE', href: `/users/${user.id}` },
                ]
            }))
            res.status(200).json(users)
        } else
            res.status(500).json({ "mensagem": "Ocorreu um erro inesperado." })
    } catch (error) {
        console.log("Erro ao buscar users: ", error);
        res.status(500).json({ "mensagem": "Ocorreu um erro inesperado." })
    }
})

// cadastra um novo usuário pela API Rest
app.post("/users", async (req, res) => {
    const { username, password } = req.body;
    const dados = {
        username,
        password
    }

    try {
        const response = await axios.post(`${API_REST}`, dados, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        console.log(response.data);
        res.redirect('/login');
    } catch (err){
        res.redirect("/error");
        console.log("An erro has ocurred while post user: ", err.response);
    }
})

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Recuperar um user pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do user a ser encontrado
 *     responses:
 *       200:
 *         description: User encontrado com sucesso
 *       404:
 *         description: User não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.get("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${API_REST}/${id}`);
        if(response.status === 200)
            res.json(response.data)
        else if(response.status === 404)
            res.status(404).json({ "mensagem": "User não encontrado." })
        else
            res.json({ "mensagem": "Ocorreu um erro inesperado." })
    } catch (error) {
        console.log("Erro ao buscar user: ", error);
        res.json({ "mensagem": "Ocorreu um erro inesperado." })
    }
})

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Atualizar parcialmente um user pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do user a ser atualizado
 *     responses:
 *       200:
 *         description: User atualizado com sucesso
 *       404:
 *         description: User não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.patch("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.patch(`${API_REST}/${id}`);
        if(response.status === 200)
            res.status(200).json(response.data)
        else if(response.status === 404)
            res.status(404).json({ "mensagem": "User não encontrado." })
        else
            res.status(500).json({ "mensagem": "Ocorreu um erro inesperado." })
    } catch (error) {
        console.log("Erro ao atualizar user: ", error);
        res.status(500).json({ "mensagem": "Ocorreu um erro inesperado." })
    }
})

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Excluir um user pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O ID do user a ser excluído
 *     responses:
 *       200:
 *         description: User excluído com sucesso
 *       404:
 *         description: User não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.delete(`${API_REST}/${id}`);
        if(response.status === 200)
            res.status(200).json(response.data)
        else if(response.status === 404)
            res.status(404).json({ "mensagem": "User não encontrado." })
        else
            res.status(500).json({ "mensagem": "Ocorreu um erro inesperado." })
    } catch (error) {
        console.log("Erro ao deletar user: ", error);
        res.status(500).json({ "mensagem": "Ocorreu um erro inesperado." })
    }
})

// login
app.get("/login", (req, res) => {    
    res.sendFile('login.html', { root: 'public' });
})

// login
app.post("/login", async (req, res) => {    
    const { username, password } = req.body;
    try {
        const user = (await axios.get(`${API_REST+username}`)).data; // get use by username from rest api
        
        if(!user || password != user.password)
            // res.redirect("/error");
            return res.status(401).json({ error: "Credenciais inválidas" });

        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/");
    } catch (err) {
        res.redirect("/error");
        console.log("An erro has ocurred while post user: ", err.response);
    }
    res.sendFile('login.html', { root: 'public' });
})

// Logout (Remover Token)
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});


app.get("/error", (req, res) => {
    res.sendFile('error.html', { root: 'public' });
})

app.listen(port,'0.0.0.0', () => {
    console.log(`App is running at port ${port}...`);
})