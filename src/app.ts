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

async function salvarArquivo (produtos: Produto[]): Promise<void> {
    try {
        const texto = JSON.stringify(produtos, null, 2);
        await fs.writeFile("dados/produtos.json", texto, "utf-8");
    }
    catch (erro) {
        console.error("Erro ao salvar o arquivo:", erro);
    }
}

app.get("/", async (req: Request, res : Response) => {
    const produtos = await lerArquivo();
    res.render("index", {produtos});
})

app.get("/api/produtos", async (req: Request, res: Response) => {
    const produtos = await lerArquivo();
    res.json({ sucesso: true, dados: produtos});
})

app.post("/api/produtos", async (req: Request, res: Response) => {
    const { nome, preco, categoria, estoque } = req.body;
    const produtos = await lerArquivo();

    const maxId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) : 0;

    const novoProduto: Produto = {
        id: maxId + 1,
        nome,
        preco: Number(preco),
        categoria,
        estoque: Number(estoque),
        disponivel: true
    };

    produtos.push(novoProduto);
    await salvarArquivo(produtos);

    res.status(201).json({ sucesso: true, dados: novoProduto });
})

app.get("/api/produtos/:id", async (req: Request, res: Response) => {
    const {id} = req.params
    const produtos = await lerArquivo();
    const produtoEncontrado = produtos.find(p => p.id === Number(id));

    if (!produtoEncontrado) {
        return res.status(404).json({
            sucesso: false,
            erro: ["Produto Não Encontrado"]
        });
    }

    res.json({
        sucesso: true,
        dados: produtoEncontrado
    })

})

app.put("/api/produtos/:id", async (req: Request, res: Response) => {
    const {id} = req.params;
    const corpo = req.body as AtualizarProdutoBody;
    let produtos = await lerArquivo();
    
    const index = produtos.findIndex(p => p.id === Number(id));

    if (index === -1) {
        return res.status(404).json({ 
            sucesso: false,
            erro: ["Produto não encontrado"]
        })
    };


    
    const produtoEditado: Produto = {
        ...produtos[index],
        ...corpo,
        id: produtos[index]!.id
    } as Produto;

    produtos[index] = produtoEditado;

    await salvarArquivo(produtos);

    res.json({ sucesso: true, dados: produtos[index] });
})