import { execSync } from "child_process";

const port = process.argv[2] || "3000";

try {
  if (process.platform === "win32") {
    const result = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = result.split("\n").filter((l) => l.includes("LISTENING"));
    for (const line of lines) {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== "0") {
        execSync(`taskkill /PID ${pid} /F`);
        console.log(`Killed PID ${pid} on port ${port}`);
      }
    }
  } else {
    execSync(`lsof -ti:${port} | xargs kill -9`);
    console.log(`Killed process on port ${port}`);
  }
} catch {
  // No process on the port, that's fine
}

console.log(`Port ${port} is free`);
