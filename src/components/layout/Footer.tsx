export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container py-8 text-center text-sm text-foreground/70">
        <p>&copy; {new Date().getFullYear()} SmartSYS Digital Solutions. Todos los derechos reservados.</p>
        <p className="mt-1">Innovación y tecnología para tu negocio.</p>
      </div>
    </footer>
  );
}
