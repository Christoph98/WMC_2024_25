export function add(a: number, b: number): number {
  return a + b;
}
for (let i = 0; i < 5; i++) {
  const a = Math.round(Math.random() * 10);
  const b = Math.round(Math.random() * 10);
  console.log(`Addition ${i}: ${a} + ${b} = ${add(a,b)}`);
}