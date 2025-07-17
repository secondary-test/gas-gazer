
import { useGasStore } from "@/store/gasStore";
import { useEffect, useRef } from "react";

const ENDPOINTS = {
  ethereum: "wss://eth-mainnet.g.alchemy.com/v2/kscW97PALFMOZGXk0OT8c",
  polygon: "wss://polygon-mainnet.g.alchemy.com/v2/O8dOfIyU5Y0rdmD5f1CD-",
  arbitrum: "wss://arb-mainnet.g.alchemy.com/v2/ejljm1j7PQ8LietEzStvz"
} as const;

const PUBLIC_RPCS = {
  ethereum: "https://cloudflare-eth.com",
  polygon: "https://polygon-rpc.com",
  arbitrum: "https://arb1.arbitrum.io/rpc"
} as const;

type ChainKey = keyof typeof ENDPOINTS;

type WSRefs = Partial<Record<ChainKey, WebSocket>>;

function parseBaseFee(hex: string) {
  return parseInt(hex, 16) / 1e9;
}
function parseGwei(hex: string) {
  return parseInt(hex, 16) / 1e9;
}

async function fetchGasPriceFromRpc(chain) {
  const url = PUBLIC_RPCS[chain];
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 42,
        method: "eth_gasPrice",
        params: []
      })
    });
    const data = await res.json();
    if (data && data.result) {
      return parseGwei(data.result);
    }
  } catch (err) {}
  return 0;
}

export function useGasWebSocket() {
  const { updateChainData, setUsdPrice } = useGasStore();
  const wsRefs = useRef<WSRefs>({});

  useEffect(() => {
    let stopped = false;
    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await res.json();
        if (!stopped && data.ethereum && data.ethereum.usd) {
          setUsdPrice(data.ethereum.usd);
        }
      } catch (err) {}
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [setUsdPrice]);

  useEffect(() => {
    (Object.keys(ENDPOINTS) as ChainKey[]).forEach((chain) => {
      const url = ENDPOINTS[chain];
      let ws = new WebSocket(url);
      wsRefs.current[chain] = ws;
      ws.onopen = () => {
        console.log(`[${chain}] WebSocket opened:`, url);
        ws.send(
          JSON.stringify({
            id: 1,
            method: "eth_subscribe",
            params: ["newHeads"]
          })
        );
      };
      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`[${chain}] WebSocket message:`, data);
          if (
            data.method === "eth_subscription" &&
            data.params &&
            data.params.result
          ) {
            const block = data.params.result;
            let baseFee = block.baseFeePerGas ? parseBaseFee(block.baseFeePerGas) : 0;
            let priorityFee = 0;
            const timestamp = block.timestamp ? parseInt(block.timestamp, 16) : Math.floor(Date.now() / 1000);
            if (
              chain === "arbitrum" ||
              (chain === "polygon" && (!block.baseFeePerGas || baseFee === 0)) ||
              (chain === "ethereum" && (!block.baseFeePerGas || baseFee === 0))
            ) {
              const rpcWs = wsRefs.current[chain];
              let usedFallback = false;
              let fallbackGasPrice = 0;
              if (rpcWs && rpcWs.readyState === 1) {
                const req = {
                  id: 3,
                  method: "eth_gasPrice",
                  params: []
                };
                rpcWs.send(JSON.stringify(req));
                const onGasPrice = async (e) => {
                  try {
                    const resp = JSON.parse(e.data);
                    if (resp.id === 3 && resp.result) {
                      baseFee = parseGwei(resp.result);
                      if (!baseFee || baseFee < 0.1) {
                        usedFallback = true;
                        fallbackGasPrice = await fetchGasPriceFromRpc(chain);
                        if (fallbackGasPrice > 0) baseFee = fallbackGasPrice;
                      }
                      priorityFee = 0;
                      updateChainData(chain, (prev) => {
                        const prevHistory = prev?.history || [];
                        const newPoint = {
                          timestamp,
                          baseFee,
                          priorityFee,
                          totalFee: baseFee + priorityFee
                        };
                        const history = [...prevHistory, newPoint].slice(-100);
                        return {
                          baseFee,
                          priorityFee,
                          isConnected: true,
                          history
                        };
                      });
                      rpcWs.removeEventListener('message', onGasPrice);
                    }
                  } catch (err) {}
                };
                rpcWs.addEventListener('message', onGasPrice);
                return;
              } else {
                baseFee = await fetchGasPriceFromRpc(chain);
                priorityFee = 0;
                updateChainData(chain, (prev) => {
                  const prevHistory = prev?.history || [];
                  const newPoint = {
                    timestamp,
                    baseFee,
                    priorityFee,
                    totalFee: baseFee + priorityFee
                  };
                  const history = [...prevHistory, newPoint].slice(-100);
                  return {
                    baseFee,
                    priorityFee,
                    isConnected: true,
                    history
                  };
                });
                return;
              }
            }
            if (chain === "ethereum" || chain === "polygon") {
              try {
                const rpcWs = wsRefs.current[chain];
                if (rpcWs && rpcWs.readyState === 1) {
                  const req = {
                    id: 2,
                    method: "eth_maxPriorityFeePerGas",
                    params: []
                  };
                  rpcWs.send(JSON.stringify(req));
                  const onPriorityFee = (e) => {
                    try {
                      const resp = JSON.parse(e.data);
                      if (resp.id === 2 && resp.result) {
                        priorityFee = parseGwei(resp.result);
                        console.log(`[${chain}] Real priority fee:`, priorityFee);
                        updateChainData(chain, (prev) => {
                          const prevHistory = prev?.history || [];
                          const newPoint = {
                            timestamp,
                            baseFee,
                            priorityFee,
                            totalFee: baseFee + priorityFee
                          };
                          const history = [...prevHistory, newPoint].slice(-100);
                          return {
                            baseFee,
                            priorityFee,
                            isConnected: true,
                            history
                          };
                        });
                        rpcWs.removeEventListener('message', onPriorityFee);
                      }
                    } catch (err) {}
                  };
                  rpcWs.addEventListener('message', onPriorityFee);
                  return;
                }
              } catch (err) {
                console.warn(`[${chain}] Failed to fetch real priority fee, using 1.5`);
                priorityFee = 1.5;
              }
            } else if (chain === "arbitrum") {
              priorityFee = 0;
            }
            updateChainData(chain, (prev) => {
              const prevHistory = prev?.history || [];
              const newPoint = {
                timestamp,
                baseFee,
                priorityFee,
                totalFee: baseFee + priorityFee
              };
              const history = [...prevHistory, newPoint].slice(-100);
              return {
                baseFee,
                priorityFee,
                isConnected: true,
                history
              };
            });
          }
        } catch (e) {
          console.error(`[${chain}] Error parsing WebSocket message:`, e, event.data);
        }
      };
      ws.onerror = (err) => {
        console.error(`[${chain}] WebSocket error:`, err);
        updateChainData(chain, { isConnected: false });
      };
      ws.onclose = (event) => {
        console.warn(`[${chain}] WebSocket closed:`, event);
        updateChainData(chain, { isConnected: false });
      };
    });
    return () => {
      (Object.entries(wsRefs.current) as [ChainKey, WebSocket][]).forEach(([chain, ws]) => {
        if (ws) {
          console.log(`[${chain}] Closing WebSocket.`);
          ws.close();
        }
      });
    };
  }, [updateChainData]);
} 