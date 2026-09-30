"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
};

type ProductImagesProps = {
  productId: string;
  images: ProductImage[];
};

export default function ProductImages({
  productId,
  images,
}: ProductImagesProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select an image.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must not exceed 10MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("alt_text", altText.trim());

      const response = await fetch(
        `/api/admin/products/${productId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to upload the image."
        );
        return;
      }

      setSuccess("Image uploaded successfully.");

      setAltText("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.refresh();
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Something went wrong while uploading the image.");
    } finally {
      setUploading(false);
    }
  }

  async function setPrimary(imageId: string) {
    setWorkingId(imageId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_primary: true,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to set primary image."
        );
        return;
      }

      setSuccess("Primary image updated.");
      router.refresh();
    } catch (error) {
      console.error("Primary image error:", error);
      setError("Unable to update the primary image.");
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteImage(imageId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this image?"
    );

    if (!confirmed) {
      return;
    }

    setWorkingId(imageId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to remove the image."
        );
        return;
      }

      setSuccess("Image removed successfully.");
      router.refresh();
    } catch (error) {
      console.error("Delete image error:", error);
      setError("Unable to remove the image.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Product Images</h2>

          <p className="admin-page-introduction">
            Manage the images displayed for this product.
          </p>
        </div>

        <p className="admin-record-count">
          {images.length} images
        </p>
      </div>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success-message">
          {success}
        </div>
      )}

      <form
        onSubmit={handleUpload}
        className="admin-image-upload-form"
      >
        <div className="admin-image-upload-fields">
          <div className="admin-form-field">
            <label htmlFor="product-image">
              Upload Image
            </label>

            <input
              ref={fileInputRef}
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />

            <small>
              JPG, PNG or WebP. Maximum 10MB.
            </small>
          </div>

          <div className="admin-form-field">
            <label htmlFor="image-alt-text">
              Alt Text
            </label>

            <input
              id="image-alt-text"
              type="text"
              value={altText}
              onChange={(event) =>
                setAltText(event.target.value)
              }
              placeholder="Example: Plain black shirt front view"
            />
          </div>

          <div className="admin-image-upload-action">
            <button
              type="submit"
              className="admin-save-status-button"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>
      </form>

      {images.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No product images</h3>

          <p>
            Upload the first image for this product.
          </p>
        </div>
      ) : (
        <div className="admin-product-image-grid">
          {images.map((image) => (
            <div
              key={image.id}
              className="admin-product-image-card"
            >
              <div className="admin-product-image-preview">
                <img
                  src={image.image_url}
                  alt={
                    image.alt_text ||
                    "DCClothings product image"
                  }
                />

                {image.is_primary && (
                  <span className="admin-image-primary-badge">
                    Primary
                  </span>
                )}
              </div>

              <div className="admin-product-image-details">
                <p>
                  {image.alt_text ||
                    "No alt text provided"}
                </p>

                <span>
                  Display order: {image.display_order}
                </span>
              </div>

              <div className="admin-product-image-actions">
                {!image.is_primary && (
                  <button
                    type="button"
                    className="admin-table-action-button"
                    onClick={() =>
                      setPrimary(image.id)
                    }
                    disabled={workingId === image.id}
                  >
                    {workingId === image.id
                      ? "Saving..."
                      : "Set Primary"}
                  </button>
                )}

                <button
                  type="button"
                  className="admin-table-cancel-button"
                  onClick={() =>
                    deleteImage(image.id)
                  }
                  disabled={workingId === image.id}
                >
                  {workingId === image.id
                    ? "Working..."
                    : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}