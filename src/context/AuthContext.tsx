import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tenant, User, RoleType } from '../types';

interface AuthContextType {
  activeTenant: Tenant | null;
  activeTenantId: string;
  userRole: RoleType;
  userName: string;
  availableTenants: Tenant[];
  currentUser: User | null;
  isPlatformAdmin: boolean;
  setIsPlatformAdmin: (val: boolean) => void;
  switchTenant: (tenantId: string) => void;
  switchRole: (role: RoleType) => void;
  refreshTenantData: () => Promise<void>;
  isLoading: boolean;
  currencySymbol: string;
  formatMoney: (amount: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant_lagos_tech');
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [userRole, setUserRole] = useState<RoleType>('OWNER');
  const [userName, setUserName] = useState<string>('Adebayo Ogunlesi');
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr_owner_1',
    email: 'adebayo@lagostech.com',
    name: 'Adebayo Ogunlesi',
    phone: '+234 803 123 4567',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z'
  });
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTenantData = useCallback(async (tenantId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/tenants/current', {
        headers: {
          'x-tenant-id': tenantId,
          'x-user-role': userRole,
          'x-user-name': userName
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveTenant(data.data);
      }

      // Fetch all tenants for tenant switcher
      const allRes = await fetch('/api/v1/admin/tenants');
      const allData = await allRes.json();
      if (allData.success && allData.data) {
        setAvailableTenants(allData.data);
      }
    } catch (e) {
      console.error('Error fetching tenant context:', e);
    } finally {
      setIsLoading(false);
    }
  }, [userRole, userName]);

  useEffect(() => {
    fetchTenantData(activeTenantId);
  }, [activeTenantId, fetchTenantData]);

  const switchTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    setIsPlatformAdmin(false);
  };

  const switchRole = (role: RoleType) => {
    setUserRole(role);
    if (role === 'CASHIER') {
      setUserName('Chioma Okeke (Cashier)');
    } else if (role === 'INVENTORY_STAFF') {
      setUserName('Ibrahim Musa (Inventory)');
    } else {
      setUserName('Adebayo Ogunlesi');
    }
  };

  const refreshTenantData = async () => {
    await fetchTenantData(activeTenantId);
  };

  const currencySymbol = activeTenant?.currency === 'USD' ? '$' : activeTenant?.currency === 'GBP' ? '£' : activeTenant?.currency === 'EUR' ? '€' : '₦';

  const formatMoney = (amount: number): string => {
    const num = Number(amount) || 0;
    return `${currencySymbol}${num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        activeTenant,
        activeTenantId,
        userRole,
        userName,
        availableTenants,
        currentUser,
        isPlatformAdmin,
        setIsPlatformAdmin,
        switchTenant,
        switchRole,
        refreshTenantData,
        isLoading,
        currencySymbol,
        formatMoney
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
