import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center 
    justify-center">
      hii
      <Button>Primary</Button><br />

      <Button variant="secondary">Secondary</Button><br />

      <Button variant="outline">Outline</Button><br />

      <Button size="lg">Large Button</Button><br />
    </div>
  );
}
