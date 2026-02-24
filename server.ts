import express from 'express';
import dotenv from 'dotenv';
import userRoutes from "./routes/users";
import categoryRoutes from "./routes/category";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import cors from "cors";
import { midtransWebhookController } from './controllers/midtrans';
import { limiter } from './middleware/rateLimit';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(limiter); 

//routes API
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api/midtrans/webhook", midtransWebhookController);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: true,
    msg: 'API sehat wal afiat, Alhamdulillah',
  });
});

app.get('/', (req, res) => {
  res.send('E-Commerce API by King Dean');
});

app.listen(PORT, () => {
  console.log(`E-Commerce API is running on port ${PORT}`);
});