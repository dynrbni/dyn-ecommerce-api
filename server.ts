import express from 'express';
import dotenv from 'dotenv';
import userRoutes from "./routes/users";
import categoryRoutes from "./routes/category";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//routes API
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);


app.get('/', (req, res) => {
  res.send('E-Commerce API by King Dean');
});

app.listen(PORT, () => {
  console.log(`E-Commerce API is running on port ${PORT}`);
});