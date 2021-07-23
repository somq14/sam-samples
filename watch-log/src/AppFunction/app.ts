export const handler = async () => {
  console.info("begin handler");
  console.error("[ALERT] 何かが起きました");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};
