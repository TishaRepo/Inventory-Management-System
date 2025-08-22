import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import { getItem, createItem, updateItem } from "../services/api";

const ItemFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const qrCodeRef = useRef(null);
  const [isViewing, setIsViewing] = useState(isEditing);

  // Get today's date in YYYY-MM-DD format. This will now be our minimum allowed date.
  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    item_name: "",
    purchaser_name: "",
    purchase_date: "",
    purchase_amount: "" ,
    storage_location: "",
    provisional_asset_number: "",
    qr_number: "",
    remarks: "",
    // photo_base64: 
    
  });

  useEffect(() => {
    if (isEditing) {
      const loadItemData = async () => {
        try {
          const item = await getItem(id);
          const formattedDate = item.purchase_date
            ? new Date(item.purchase_date).toISOString().slice(0, 10)
            : "";
          setFormData({ ...item, purchase_date: formattedDate });
        } catch (error) {
          toast.error(error.message);
          navigate("/");
        }
      };
      loadItemData();
    } else {
      // For new items, default date to today
      setIsViewing(false);
      setFormData((prev) => ({ ...prev, purchase_date: today }));
    }
  }, [id, isEditing, navigate, today]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update then switch to view mode and refresh formData with saved item
        const updated = await updateItem(id, formData);
        setFormData(updated);
        setIsViewing(true);
        toast.success("Item updated successfully!");
      } else {
        // Create: exclude asset fields which must not exist during registration
        const payload = { ...formData };
        delete payload.qr_number;
        delete payload.provisional_asset_number;
        
        const created = await createItem(payload);
        toast.success("Item created successfully!");
        navigate('/items');
        return; // avoid further navigation
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo_base64: reader.result }));
        toast.info("Photo is ready to be saved.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    const canvas = qrCodeRef.current.querySelector("canvas");
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
                <html><head><title>Print QR Code</title></head>
                <body style="text-align: center; margin-top: 50px;">
                    
                    <img src="${dataUrl}" style="width: 300px; height: 300px;" />
                    <script>window.onload = () => { window.print(); window.close(); };</script>
                </body></html>
            `);
      printWindow.document.close();
    }
  };

const MediaSection = () => {
  // ✅ prepare pretty QR string here
  // Exclude photo_base64 from the QR content so scans don't include the image data.
  const qrData = Object.entries(formData)
    .filter(([key, value]) => key !== 'photo_base64' && value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return (
    <div className="media-container">
      {formData.qr_number && (
        <div ref={qrCodeRef} className="media-box">
          <h3>Generated QR Code</h3>
          <QRCodeCanvas
            value={qrData}   // <-- use pretty format here (photo excluded)
            size={150}
            includeMargin={true}
            className="qr-code-canvas"
          />
          {isViewing && (
            <button
              type="button"
              onClick={handlePrint}
              className="print-button"
            >
              Print QR Code
            </button>
          )}
        </div>
      )}

      <div className="media-box">
        <h3>Item Photo</h3>
        <div className="photo-preview-box">
          {formData.photo_base64 ? (
            <img
              src={formData.photo_base64}
              alt="Item Preview"
              className="photo-preview"
            />
          ) : (
            <span>No Photo</span>
          )}
        </div>
        {!isViewing && (
          <>
            <label htmlFor="photo-upload" className="upload-button">
              Upload / Change Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
};


  return (
    <div>
      <div className="form-header">
        {isEditing && isViewing ? (
          <Link to="/items" className="button-link">
            &#8592; View All Items
          </Link>
        ) : (
          <div style={{ minWidth: "150px" }}></div>
        )}
        <h2>
          {isEditing
            ? isViewing
              ? "View Item Details"
              : "Edit Item Information"
            : "Register New Item"}
        </h2>
        <div className="header-actions">
          {isViewing && (
            <button onClick={() => setIsViewing(false)} className="button-link">
              Edit Item
            </button>
          )}
        </div>
      </div>

      {isViewing ? (
        <div className="view-container">
          <div className="view-grid">
            <ViewField label="Item Name" value={formData.item_name} />
            <ViewField label="Purchaser Name" value={formData.purchaser_name} />
            <ViewField
              label="Purchase Date"
              value={
                formData.purchase_date
                  ? new Date(formData.purchase_date).toLocaleDateString()
                  : "N/A"
              }
            />
            <ViewField
              label="Purchase Amount"
              value={`¥${Number(formData.purchase_amount).toLocaleString()}`}
            />
            
            <ViewField
              label="Storage Location"
              value={formData.storage_location}
              isEditing={isEditing}
            />
            <ViewField
              label="Remarks"
              value={`${String(formData.remarks).toLocaleString()}`}
            />
            <ViewField
              label="Provisional/Final Asset No."
              value={formData.provisional_asset_number}
              
            />
            <ViewField 
            label="QR Number" 
            value={formData.qr_number} 
             // Show QR Number only when viewing or editing
            />
            
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-grid">
            <FormField
              label="Item Name"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              required
            />
            <FormField
              label="Purchaser Name"
              name="purchaser_name"
              value={formData.purchaser_name}
              onChange={handleChange}
              required
            />

            {/* THE ONLY CHANGE IS HERE: max has been changed to min */}
            <FormField
              label="Purchase Date"
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={handleChange}
              disabled={isEditing}             // non-editable when editing existing item
              readOnly={isEditing}
              min={isEditing ? undefined : today}
              required
            />
            <FormField
              label="Purchase Amount (JPY)"
              name="purchase_amount"
              type="number"
              value={formData.purchase_amount}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="Storage Location"
              name="storage_location"
              value={formData.storage_location}
              onChange={handleChange}
            />
            <FormField
              label="Remarks"
              name="remarks"
              type="string"
              value={formData.remarks}
              onChange={handleChange}
              
            />
            {/* Asset fields only visible when editing */}
            {isEditing && (
              <>
                <FormField
                  label="Provisional/Final Asset Number"
                  name="provisional_asset_number/final_asset_number"
                  value={formData.provisional_asset_number}
                  onChange={handleChange}
                />
                <FormField
                  label="QR Number"
                  name="qr_number"
                  value={formData.qr_number}
                  onChange={handleChange}
                />
                
              </>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() =>
                isEditing ? setIsViewing(true) : navigate("/items")
              }
              className="back-button"
            >
              {isEditing ? "Cancel Edit" : "Cancel"}
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      )}
      {isEditing && <MediaSection />}
    </div>
  );
};

// Reusable components
const FormField = ({ label, ...props }) => (
  <div className="form-field">
    <label htmlFor={props.name}>{label}</label>
    <input id={props.name} {...props} />
  </div>
);
const ViewField = ({ label, value }) => (
  <div className="view-field">
    <strong>{label}:</strong>
    <p>{value || "N/A"}</p>
  </div>
);

export default ItemFormPage;
