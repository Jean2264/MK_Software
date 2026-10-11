import "./ProductImage.css";

function ProductImage({ src, alt = "imagen del producto" }) {
  return (
    <div className="product-image">
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="product-image-placeholder">
          <i className="bi bi-image" aria-hidden="true"></i>
          <span>MK</span>
        </div>
      )}
    </div>
  );
}
export default ProductImage;
