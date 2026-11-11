"use client";

import { useId, useState } from "react";
import api from "@/lib/authAxios";
import { getErrorMessage } from "@/lib/errors";
import type { Address, AddressInput } from "@/types/commerce";
import { FormField } from "@/components/forms/FormField";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Common cities (suggestions only; any city is accepted). */
const CITIES = [
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Savar",
  "Chattogram",
  "Cox's Bazar",
  "Cumilla",
  "Sylhet",
  "Khulna",
  "Jashore",
  "Rajshahi",
  "Bogura",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

/** Bangladeshi mobile number: 01XXXXXXXXX, optionally with +88 / 88. */
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const POSTAL_RE = /^\d{4}$/;

type Values = {
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.fullName.trim()) e.fullName = "Enter the recipient's full name.";
  const phone = v.phone.replace(/[\s-]/g, "");
  if (!phone) e.phone = "Enter a mobile number for the delivery man.";
  else if (!PHONE_RE.test(phone)) e.phone = "Use a Bangladeshi mobile number, e.g. 01712345678.";
  if (!v.addressLine.trim()) e.addressLine = "Enter the house, road and block.";
  if (!v.city.trim()) e.city = "Enter the city.";
  if (v.postalCode.trim() && !POSTAL_RE.test(v.postalCode.trim())) e.postalCode = "Postal codes have 4 digits.";
  return e;
}

type AddressFormProps = {
  /** Editing an existing address; omitted = create. */
  address?: Address | null;
  onSaved: (address: Address) => void;
  onCancel?: () => void;
  /** Offer the "default address" checkbox. */
  showDefault?: boolean;
  submitLabel?: string;
};

/** Create / edit an address (`POST /addresses`, `PATCH /addresses/:id`). */
export function AddressForm({ address, onSaved, onCancel, showDefault = true, submitLabel }: AddressFormProps) {
  const id = useId();
  const [values, setValues] = useState<Values>({
    label: address?.label ?? "",
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    addressLine: address?.addressLine ?? "",
    area: address?.area ?? "",
    city: address?.city ?? "",
    postalCode: address?.postalCode ?? "",
    isDefault: address?.isDefault ?? false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Values>(key: K) => (value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      // Move focus to the first invalid field.
      const first = (Object.keys(found) as (keyof Values)[])[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    const body: AddressInput = {
      label: values.label.trim() || undefined,
      fullName: values.fullName.trim(),
      phone: values.phone.replace(/[\s-]/g, ""),
      addressLine: values.addressLine.trim(),
      area: values.area.trim() || undefined,
      city: values.city.trim(),
      postalCode: values.postalCode.trim() || undefined,
      isDefault: showDefault ? values.isDefault : undefined,
    };
    setSaving(true);
    setFormError("");
    try {
      const res = address
        ? await api.patch<Address>(`/addresses/${address.id}`, body)
        : await api.post<Address>("/addresses", body);
      onSaved(res.data);
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the address."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      {formError ? <FormMessage variant="error">{formError}</FormMessage> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${id}-fullName`} label="Full name" error={errors.fullName} required>
          <Input autoComplete="name" value={values.fullName} onChange={(e) => set("fullName")(e.target.value)} />
        </FormField>
        <FormField id={`${id}-phone`} label="Mobile number" error={errors.phone} hint="The delivery man will call this number." required>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </FormField>
      </div>
      <FormField id={`${id}-addressLine`} label="Address" error={errors.addressLine} hint="House, road, block / village" required>
        <Input autoComplete="street-address" value={values.addressLine} onChange={(e) => set("addressLine")(e.target.value)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={`${id}-area`} label="Area" error={errors.area} hint="e.g. Mirpur 10">
          <Input autoComplete="address-level3" value={values.area} onChange={(e) => set("area")(e.target.value)} />
        </FormField>
        <FormField id={`${id}-city`} label="City" error={errors.city} required>
          <Input
            autoComplete="address-level2"
            list={`${id}-cities`}
            value={values.city}
            onChange={(e) => set("city")(e.target.value)}
          />
        </FormField>
        <FormField id={`${id}-postalCode`} label="Postal code" error={errors.postalCode}>
          <Input
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={4}
            value={values.postalCode}
            onChange={(e) => set("postalCode")(e.target.value)}
          />
        </FormField>
      </div>
      <datalist id={`${id}-cities`}>
        {CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <FormField id={`${id}-label`} label="Label" hint="Optional, e.g. Home or Office">
        <Input value={values.label} maxLength={30} onChange={(e) => set("label")(e.target.value)} />
      </FormField>
      {showDefault ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-default`}
            checked={values.isDefault}
            onCheckedChange={(c) => set("isDefault")(c === true)}
          />
          <Label htmlFor={`${id}-default`} className="font-normal">
            Use as my default address
          </Label>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={saving}>
          {submitLabel ?? (address ? "Save changes" : "Save address")}
        </Button>
      </div>
    </form>
  );
}
