require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//Get Method Test

app.get("/ping", (req, res) => {
    res.status(200).json({ message: "pong" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const { v4: uuidv4 } = require("uuid");
const users = {};
const ip_register = {};

app.post("/register", (req, res) => {
    const client_ip = req.ip || req.connection.remoteAddress;

    if (
        ip_register[client_ip] &&
        users[ip_register[client_ip]]?.requestsNumber > 0
    ) {
        return res.status(403).json({
            error: "Déjà enregistré",
            message:
                "Vous ne pouvez pas vous réenregistrer tant que vous avez des requêtes restantes.",
        });
    }

    const token = uuidv4();
    users[token] = {
        userId: uuidv4(),
        token,
        requestsNumber: 10,
        last_recharge: new Date(),
        ip: client_ip,
    };

    ip_register[client_ip] = token;

    res.status(201).json({
        token,
        requestsNumber: 10,
        message: "Enregistrement réussi. Vous avez 10 requêtes.",
    });
});

// Middleware to Check Remaining Requests Number

const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token || !users[token]) {
        return res.status(401).json({ error: "Token invalide ou manquant" });
    }

    req.user = users[token];
    next();
};

//Rate Limiter Middleware

const rateLimiter = (req, res, next) => {
    const user = req.user;
    if (user.requestsNumber <= 0) {
        return res.status(429).json({
            error: "Quota épuisé",
            message: "Votre quota de requêtes est épuisé.",
        });
    }
    user.requestsNumber--;
    console.log(
        `[Requête] ${user.userId} - Quota restant : ${user.requestsNumber}`
    );
    next();
};

const rateLimit = require("express-rate-limit");
const theLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Trop de tentatives" },
  skip: (req) => {
    const token = req.headers['authorization']?.split(' ')[1];
    return token && users[token]?.requestsNumber > 0;
  }
});

// app.use(["/items", "/recharge"], theLimiter);

let items = [
    {
        id: 1,
        title: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: 1943,
        genre: "Fiction",
        language: "Français",
    },
    {
        id: 2,
        title: "1984",
        author: "George Orwell",
        year: 1949,
        genre: "Dystopie",
        language: "Anglais",
    },
    {
        id: 3,
        title: "Moby Dick",
        author: "Herman Melville",
        year: 1851,
        genre: "Aventure",
        language: "Anglais",
    },
    {
        id: 4,
        title: "Les Misérables",
        author: "Victor Hugo",
        year: 1862,
        genre: "Classique",
        language: "Français",
    },
];

//Authenticate Middleware Test without Rate Limiter

// app.get("/items", authenticate, (req, res) => {
//   res.status(200).json(items);
// });

//Authenticate Middleware Test with Rate Limiter

// app.get("/items", authenticate, rateLimiter, (req, res) => {
//   res.status(200).json(items);
// });

// Add Requests to Quota

app.post("/recharge", authenticate, (req, res) => {
    const user = req.user;
    let rechargeAmount = parseInt(req.body?.amount) || 10;

    rechargeAmount = Math.max(0, rechargeAmount);
    user.requestsNumber += rechargeAmount;
    user.last_recharge = new Date();

    res.status(200).json({
        message: `Rechargé de ${rechargeAmount} requêtes.`,
        newRequestsNumber: user.requestsNumber,
    });
});


app.get("/items", authenticate, rateLimiter, (req, res) => {
    res.status(200).json(items);
});

app.post("/items", authenticate, rateLimiter, (req, res) => {
    const newItem = { id: items.length + 1, ...req.body };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.delete("/items/:id", authenticate, rateLimiter, (req, res) => {
    items = items.filter((item) => item.id !== parseInt(req.params.id));
    res.status(204).end();
});

app.put("/items/:id", authenticate, rateLimiter, (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Item non trouvé" });
    }

    items[index] = { ...items[index], ...req.body };
    res.status(200).json(items[index]);
});
