import "./Gender.css";
import Men from "./Men";
import Women from "./Women";

export default function Gender() {
  return (
    <section className="gender-section">
      <Men />
      <Women />
    </section>
  );
}