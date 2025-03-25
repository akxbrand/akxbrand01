'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

interface Product {
  id: string;
  name: string;
  price: number;
  minBulkQuantity?: number;
  isBulkEnabled: boolean;
}

interface BulkProductsModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (products: Product[]) => void;
}

export default function BulkProductsModal({
  visible,
  onHide,
  onSave,
}: BulkProductsModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (visible) {
      fetchProducts();
    }
  }, [visible]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.map((product: Product) => ({
        ...product,
        isBulkEnabled: product.minBulkQuantity !== undefined,
      })));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkToggle = (productId: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? {
              ...product,
              isBulkEnabled: !product.isBulkEnabled,
              minBulkQuantity: !product.isBulkEnabled ? 10 : undefined,
            }
          : product
      )
    );
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, minBulkQuantity: value }
          : product
      )
    );
  };

  const statusBodyTemplate = (rowData: Product) => {
    return (
      <Tag
        value={rowData.isBulkEnabled ? 'Enabled' : 'Disabled'}
        severity={rowData.isBulkEnabled ? 'success' : 'danger'}
      />
    );
  };

  const quantityBodyTemplate = (rowData: Product) => {
    return (
      <InputNumber
        value={rowData.minBulkQuantity}
        onValueChange={(e) => handleQuantityChange(rowData.id, e.value || 0)}
        min={1}
        disabled={!rowData.isBulkEnabled}
        showButtons
        buttonLayout="horizontal"
        decrementButtonClassName="p-button-secondary"
        incrementButtonClassName="p-button-secondary"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
      />
    );
  };

  const actionBodyTemplate = (rowData: Product) => {
    return (
      <Button
        label={rowData.isBulkEnabled ? 'Disable' : 'Enable'}
        severity={rowData.isBulkEnabled ? 'danger' : 'success'}
        onClick={() => handleBulkToggle(rowData.id)}
        size="small"
      />
    );
  };

  const handleSave = async () => {
    try {
      const bulkProducts = products.filter(p => p.isBulkEnabled);
      await fetch('/api/admin/bulk-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkProducts),
      });
      onSave(bulkProducts);
      onHide();
    } catch (error) {
      console.error('Error saving bulk products:', error);
    }
  };

  return (
    <Dialog
      header="Manage Bulk Order Products"
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '1200px' }}
      modal
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" onClick={onHide} />
          <Button
            label="Save Changes"
            icon="pi pi-check"
            onClick={handleSave}
            severity="success"
          />
        </div>
      }
    >
      <div className="mt-4">
        <DataTable
          value={products}
          paginator
          rows={10}
          loading={loading}
          emptyMessage="No products found"
          className="p-datatable-sm"
          showGridlines
          stripedRows
        >
          <Column field="name" header="Product Name" sortable />
          <Column
            field="price"
            header="Price"
            body={(rowData) => `₹${rowData.price.toLocaleString()}`}
            sortable
          />
          <Column
            field="isBulkEnabled"
            header="Bulk Status"
            body={statusBodyTemplate}
            sortable
          />
          <Column
            field="minBulkQuantity"
            header="Min. Quantity"
            body={quantityBodyTemplate}
          />
          <Column
            body={actionBodyTemplate}
            header="Actions"
            style={{ width: '150px' }}
          />
        </DataTable>
      </div>
    </Dialog>
  );
}