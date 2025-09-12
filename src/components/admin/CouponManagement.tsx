import React, { useState } from 'react';
import { Ticket, Plus, Edit, Trash2, Copy, Calendar, Percent, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import { Coupon } from '../../types';

interface CouponManagementProps {
  coupons: Coupon[];
  onCreateCoupon: (coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateCoupon: (couponId: string, updates: Partial<Coupon>) => void;
  onDeleteCoupon: (couponId: string) => void;
}

export function CouponManagement({ coupons, onCreateCoupon, onUpdateCoupon, onDeleteCoupon }: CouponManagementProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    max_uses: null as number | null,
    expires_at: '',
    scope: 'global' as 'plan' | 'addon' | 'global',
    active: true,
  });

  const typeOptions = [
    { value: 'percentage', label: 'Porcentaje (%)' },
    { value: 'fixed', label: 'Cantidad Fija (€)' },
  ];

  const scopeOptions = [
    { value: 'global', label: 'Global' },
    { value: 'plan', label: 'Solo Planes' },
    { value: 'addon', label: 'Solo Add-ons' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      ...formData,
      expires_at: formData.expires_at || null,
      used_count: 0,
    };
    
    if (editingCoupon) {
      onUpdateCoupon(editingCoupon.id, couponData);
      setEditingCoupon(null);
    } else {
      onCreateCoupon(couponData);
      setIsCreating(false);
    }
    
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      max_uses: null,
      expires_at: '',
      scope: 'global',
      active: true,
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      max_uses: coupon.max_uses,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      scope: coupon.scope,
      active: coupon.active,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      max_uses: null,
      expires_at: '',
      scope: 'global',
      active: true,
    });
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  const copyCouponCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.active) {
      return { variant: 'outline' as const, label: 'Inactivo', color: 'text-gray-400' };
    }
    
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { variant: 'destructive' as const, label: 'Expirado', color: 'text-red-400' };
    }
    
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { variant: 'warning' as const, label: 'Agotado', color: 'text-yellow-400' };
    }
    
    return { variant: 'success' as const, label: 'Activo', color: 'text-green-400' };
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.max_uses) return 0;
    return (coupon.used_count / coupon.max_uses) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 rounded-lg">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Gestión de Cupones</h1>
            <p className="text-gray-400">Crear y gestionar códigos de descuento</p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cupón
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código del Cupón
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="DESCUENTO20"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCouponCode}
                    >
                      Generar
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Descuento
                  </label>
                  <Select
                    options={typeOptions}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor del Descuento {formData.type === 'percentage' ? '(%)' : '(€)'}
                  </label>
                  <Input
                    type="number"
                    step={formData.type === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Usos Máximos (opcional)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Expiración (opcional)
                  </label>
                  <Input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ámbito de Aplicación
                  </label>
                  <Select
                    options={scopeOptions}
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as 'plan' | 'addon' | 'global' })}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Cupón activo
                </label>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit">
                  {editingCoupon ? 'Actualizar Cupón' : 'Crear Cupón'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Código</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Descuento</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Uso</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Ámbito</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Expiración</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const usagePercentage = getUsagePercentage(coupon);
                  
                  return (
                    <tr key={coupon.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-900 px-2 py-1 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCouponCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {coupon.type === 'percentage' ? (
                            <>
                              <Percent className="h-4 w-4 text-green-400" />
                              <span className="font-medium">{coupon.value}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-blue-400" />
                              <span className="font-medium">{formatCurrency(coupon.value)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {coupon.used_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                          </div>
                          {coupon.max_uses && (
                            <div className="w-20 bg-gray-700 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {coupon.scope}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-400">
                          {coupon.expires_at ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(coupon.expires_at)}
                            </div>
                          ) : (
                            'Sin expiración'
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteCoupon(coupon.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {coupons.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No hay cupones creados
              </h3>
              <p className="text-gray-400 mb-4">
                Crea tu primer cupón de descuento para ofrecer promociones
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Cupón
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {coupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Estadísticas de Cupones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Total Cupones</div>
                <div className="text-lg font-semibold text-gray-100">{coupons.length}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Activos</div>
                <div className="text-lg font-semibold text-green-400">
                  {coupons.filter(c => getCouponStatus(c).label === 'Activo').length}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Total Usos</div>
                <div className="text-lg font-semibold text-blue-400">
                  {coupons.reduce((sum, c) => sum + c.used_count, 0)}
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Descuento Promedio</div>
                <div className="text-lg font-semibold text-purple-400">
                  {coupons.length > 0 
                    ? `${(coupons.filter(c => c.type === 'percentage').reduce((sum, c) => sum + c.value, 0) / Math.max(coupons.filter(c => c.type === 'percentage').length, 1)).toFixed(1)}%`
                    : '0%'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}