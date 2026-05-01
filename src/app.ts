import express, { Request, Response, NextFunction } from "express";
import { promises as fs } from "fs";

const app = express();
const port = 3000;

interface Produto {
    id: number;
    nome: string;
    preco: number;
    categoria: string;
    estoque: number;
    disponivel: boolean;
}

interface CriarProdutoBody {
    nome: string;
    preco: number;
    categoria: string;
    estoque: number;
}

interface AtualizarProdutoBody {
    nome?: string;
    preco?: number;
    categoria?: string;
    estoque?: number;
    disponivel?: boolean;
}

interface ProdutoParams {
    id: string;
}

interface FiltroQuery {
    categoria?: string;
    disponivel?: string;
}

interface ApiResponse<T> {
    sucesso: boolean;
    dados?: T;
    erro?: string[];
}

let produto: Produto[] = [];
let proximoId = 1

app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static("public"));
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
    const agora = new Date().toLocaleTimeString();
    console.log(`[${agora}] ${req.method} ${req.url}`);
    next();
  });



async function lerArquivo (): Promise<Produto[]>  {
    try {
        const texto = await fs.readFile("dados/produtos.json", "utf-8");
        return JSON.parse(texto);
    }
    catch (erro) {
        return [];
    }
}

async function salvarArquivo (produtos: Produto): Promise<void> {
    try {
        const texto = JSON.stringify(produto, null, 2)
        await fs.writeFile("dados/produtos.json", texto, "utf-8");
    }
    catch (erro) {
        console.error("Erro ao salvar o arquivo:", erro);
    }
}

app.get("/api/produtos", async (req: Request, res: Response) => {
    const produtos = await lerArquivo();
    res.json({ sucesso: true, dados: produtos});
})

app.post("/api/produtos", async (req: Request, res: Response) => {
    const { nome, preco, categoria, estoque } = req.body;
    const produtos = await lerArquivo();

    const maxId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) : 0;
    const NovoProduto: Produto = {
        id: maxId + 1,
        nome,
        preco: Number(preco),
        categoria,
        estoque: Number(estoque),
        disponivel: true
    }
})