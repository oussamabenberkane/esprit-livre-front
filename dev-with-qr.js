import { spawn } from "child_process";
import qrcode from "qrcode-terminal";
import os from "os";

const npmCmd = os.platform() === "win32" ? "npm.cmd" : "npm";

const server = spawn("npm", ["run", "dev", "--", "--host"], { stdio: "pipe" });

server.stdout.on("data", (data) => {
  const output = data.toString();
  process.stdout.write(output);

  // Look for the "Network" URL that Vite prints
  const match = output.match(/http:\/\/(?:\d+\.\d+\.\d+\.\d+):\d+/);
  if (match) {
    const url = match[0];
    console.log("\n📱 Scan this QR code on your phone:\n");
    qrcode.generate(url, { small: true });
  }
});
