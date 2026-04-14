import app from "./app";
import { config } from "./core/config/config"

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});