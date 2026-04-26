"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, X, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/lib/models/product"
import { toStoredImageUrl } from "@/lib/image-url"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["flooring", "wall-paneling", "kitchen"]),
  subcategory: z.string().min(1, "Subcategory is required"),
  description: z.string().min(10, "Description is required"),
  price: z.number().positive("Price must be positive"),
  unit: z.string().min(1, "Unit is required"),
  specs: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })),
  inStock: z.boolean(),
  featured: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [slugPreview, setSlugPreview] = useState(product?.slug ?? "")
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const isEditing = !!product

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "flooring",
      subcategory: product?.subcategory ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      unit: product?.unit ?? "per sq ft",
      specs: product?.specs ?? [{ key: "", value: "" }],
      inStock: product?.inStock ?? true,
      featured: product?.featured ?? false,
    },
  })

  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specs",
  })

  const nameValue = watch("name")
  useEffect(() => {
    if (!isEditing) {
      setSlugPreview(
        nameValue
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      )
    }
  }, [nameValue, isEditing])

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/images", {
      method: "POST",
      body: formData,
    })
    const payload = await res.json()
    if (!res.ok || !payload.id) {
      throw new Error(payload?.error || "Failed to upload image")
    }

    return payload.id as string
  }

  async function onSelectFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploadedIds: string[] = []
      for (const file of Array.from(files)) {
        const id = await uploadImage(file)
        uploadedIds.push(id)
      }
      setImages((prev) => [...prev, ...uploadedIds])
      toast.success(`${uploadedIds.length} image${uploadedIds.length === 1 ? "" : "s"} uploaded`)
    } catch {
      toast.error("Failed to upload one or more images")
    } finally {
      setUploading(false)
    }
  }

  function removeImageAt(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormData) {
    if (images.length === 0) {
      toast.error("Please upload at least one image")
      return
    }

    setSubmitting(true)
    const payload = {
      ...data,
      images,
    }

    const url = isEditing ? `/api/products/${product!.slug}` : "/api/products"
    const method = isEditing ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success(isEditing ? "Product updated" : "Product created")
      router.push("/admin/products")
    } else {
      toast.error("Failed to save product")
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-2xl">

      {/* Name + slug */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs tracking-wide text-muted-foreground">Name *</Label>
          <Input id="name" {...register("name")} className="h-10 border-border text-sm" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          {!isEditing && slugPreview && (
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Slug: <span className="text-muted-foreground">{slugPreview}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-muted-foreground">Category *</Label>
            <Select
              defaultValue={product?.category ?? "flooring"}
              onValueChange={(v) => setValue("category", v as FormData["category"])}
            >
              <SelectTrigger className="h-10 border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flooring">Flooring</SelectItem>
                <SelectItem value="wall-paneling">Wall Paneling</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subcategory" className="text-xs tracking-wide text-muted-foreground">Subcategory *</Label>
            <Input id="subcategory" {...register("subcategory")} className="h-10 border-border text-sm" />
            {errors.subcategory && <p className="text-xs text-destructive">{errors.subcategory.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs tracking-wide text-muted-foreground">Description *</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
            className="border-border text-sm resize-none"
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs tracking-wide text-muted-foreground">Price (PKR) *</Label>
            <Input
            id="price"
            type="number"
            {...register("price", { valueAsNumber: true })}
            className="h-10 border-border text-sm"
          />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit" className="text-xs tracking-wide text-muted-foreground">Unit *</Label>
            <Input id="unit" {...register("unit")} placeholder="per sq ft" className="h-10 border-border text-sm" />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50">Images</p>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, i) => (
              <div key={`${image}-${i}`} className="relative aspect-[4/3] border border-border/40 overflow-hidden">
                <Image
                  src={toStoredImageUrl(image)}
                  alt={`Product image ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  onClick={() => removeImageAt(i)}
                  className="absolute top-2 right-2 bg-background/85 hover:bg-background text-foreground"
                >
                  <X size={13} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No images uploaded yet.</p>
        )}

        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => void onSelectFiles(event.target.files)}
            className="h-10 border-border text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {uploading && (
            <span className="inline-flex items-center text-xs text-muted-foreground">
              <Loader2 size={13} className="animate-spin mr-1.5" />
              Uploading
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
          <Upload size={12} />
          Upload JPG/PNG/WebP files. Each image max 8MB.
        </p>
      </div>

      {/* Specs */}
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50">Specifications</p>
        {specFields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`specs.${i}.key`)}
              placeholder="Spec name"
              className="h-9 border-border text-sm flex-1"
            />
            <Input
              {...register(`specs.${i}.value`)}
              placeholder="Value"
              className="h-9 border-border text-sm flex-1"
            />
            {specFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeSpec(i)}
                className="text-muted-foreground/50 hover:text-destructive shrink-0"
              >
                <X size={13} />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addSpec({ key: "", value: "" })} className="text-xs border-border">
          <Plus size={12} className="mr-1.5" /> Add Spec
        </Button>
      </div>

      {/* Toggles */}
      <div className="flex gap-8">
        <div className="flex items-center gap-3">
          <Switch
            id="inStock"
            defaultChecked={product?.inStock ?? true}
            onCheckedChange={(v) => setValue("inStock", v)}
          />
          <Label htmlFor="inStock" className="text-xs tracking-wide text-muted-foreground cursor-pointer">
            In Stock
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="featured"
            defaultChecked={product?.featured ?? false}
            onCheckedChange={(v) => setValue("featured", v)}
          />
          <Label htmlFor="featured" className="text-xs tracking-wide text-muted-foreground cursor-pointer">
            Featured
          </Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting} className="text-xs tracking-[0.15em] uppercase px-8">
          {submitting ? (
            <><Loader2 size={13} className="animate-spin mr-2" />{isEditing ? "Saving…" : "Creating…"}</>
          ) : (
            isEditing ? "Save Changes" : "Create Product"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          className="text-xs tracking-[0.15em] uppercase border-border"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
