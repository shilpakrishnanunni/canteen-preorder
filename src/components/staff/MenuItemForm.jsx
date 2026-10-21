import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const initialValues = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
};

const MenuItemForm = ({ item, categories, saving, error, onClose, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (item) {
      setValues({
        categoryId: String(item.categoryId ?? ""),
        name: item.name ?? "",
        description: item.description ?? "",
        price: item.price == null ? "" : String(item.price),
        imageUrl: item.imageUrl ?? "",
      });
    } else {
      setValues({ ...initialValues, categoryId: categories[0] ? String(categories[0].id) : "" });
    }
  }, [item, categories]);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setValidationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = values.name.trim();
    const description = values.description.trim();
    const price = Number(values.price);

    if (!item && !values.categoryId) {
      setValidationError("Choose a category for this item.");
      return;
    }
    if (!name) {
      setValidationError("Enter an item name.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setValidationError("Enter a price greater than ₹0.");
      return;
    }
    if (values.imageUrl.trim()) {
      try {
        const url = new URL(values.imageUrl.trim());
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid protocol");
      } catch {
        setValidationError("Enter a valid image URL beginning with http:// or https://, or leave it blank.");
        return;
      }
    }

    await onSubmit({
      categoryId: values.categoryId ? Number(values.categoryId) : undefined,
      name,
      description,
      price: Math.round(price * 100) / 100,
      imageUrl: values.imageUrl.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#172019]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="menu-item-form-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-7">
          <div>
            <p className="eyebrow text-forest">MENU MANAGEMENT</p>
            <h2 id="menu-item-form-title" className="mt-2 text-xl font-semibold tracking-tight text-ink">{item ? "Edit menu item" : "Add a menu item"}</h2>
            <p className="mt-1 text-sm leading-5 text-muted">{item ? "Update the details students see on the menu." : "Add a dish, snack, or drink to the canteen menu."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close form" className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-50"><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6 sm:px-7">
          {!item && (
            <Field label="Category" htmlFor="menu-category">
              <select id="menu-category" value={values.categoryId} onChange={setField("categoryId")} className={inputClass} required>
                <option value="">Select a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {categories.length === 0 && <p className="mt-1.5 text-xs text-amber-800">Categories could not be loaded. Close this form and retry before adding an item.</p>}
            </Field>
          )}

          <Field label="Item name" htmlFor="menu-name">
            <input id="menu-name" value={values.name} onChange={setField("name")} className={inputClass} placeholder="e.g. Vegetable puff" maxLength={120} required autoFocus />
          </Field>

          <Field label="Description" htmlFor="menu-description" hint="A short description helps students choose." >
            <textarea id="menu-description" value={values.description} onChange={setField("description")} className={`${inputClass} min-h-24 resize-y`} placeholder="Describe the dish or its ingredients" maxLength={500} rows={3} />
          </Field>

          <Field label="Price (₹)" htmlFor="menu-price">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-muted">₹</span>
              <input id="menu-price" type="number" min="0.01" step="0.01" inputMode="decimal" value={values.price} onChange={setField("price")} className={`${inputClass} pl-8`} placeholder="0.00" required />
            </div>
          </Field>

          <Field label="Image URL" htmlFor="menu-image" hint="Optional. Use a publicly accessible image URL.">
            <div className="relative">
              <ImagePlus size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" />
              <input id="menu-image" type="url" value={values.imageUrl} onChange={setField("imageUrl")} className={`${inputClass} pl-10`} placeholder="https://example.com/dish.jpg" />
            </div>
          </Field>

          {(validationError || error) && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{validationError || error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || (!item && categories.length === 0)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving…" : item ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const inputClass = "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-[#9a9e95] focus:border-forest focus:ring-4 focus:ring-forest/10 disabled:bg-canvas";

const Field = ({ label, htmlFor, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-ink">{label}</label>
    {children}
    {hint && <p className="mt-1.5 text-xs leading-5 text-muted">{hint}</p>}
  </div>
);

export default MenuItemForm;
