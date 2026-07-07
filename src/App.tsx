import { Navbar } from "./sections/Navbar";
import { Hero } from "./sections/Hero";
import { Services } from "./sections/Services";
import { Gallery } from "./sections/Gallery";
import { About } from "./sections/About";
import { QuoteForm } from "./sections/QuoteForm";
import { Footer } from "./sections/Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <About />
        <QuoteForm />
      </main>
      <Footer />
    </>
  );
}
