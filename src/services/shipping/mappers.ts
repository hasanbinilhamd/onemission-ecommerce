import type {
  RajaOngkirCityResponseItem,
  RajaOngkirDistrictResponseItem,
  RajaOngkirProvinceResponseItem,
  RajaOngkirRateCourierItem,
  ShippingCity,
  ShippingDistrict,
  ShippingProviderCityDto,
  ShippingProviderDistrictDto,
  ShippingProviderProvinceDto,
  ShippingProviderRateDto,
  ShippingProvince,
  ShippingRate,
} from './types';

export function mapShippingProvince(dto: ShippingProviderProvinceDto): ShippingProvince {
  return {
    id: dto.providerId,
    name: dto.label,
  };
}

export function mapShippingCity(dto: ShippingProviderCityDto): ShippingCity {
  return {
    id: dto.providerId,
    provinceId: dto.parentProvinceId,
    name: dto.label,
  };
}

export function mapShippingDistrict(dto: ShippingProviderDistrictDto): ShippingDistrict {
  return {
    id: dto.providerId,
    cityId: dto.parentCityId,
    name: dto.label,
    postalCode: dto.postalCode,
  };
}

export function mapShippingRate(dto: ShippingProviderRateDto): ShippingRate {
  return {
    id: dto.providerId,
    courierCode: dto.vendorCode,
    courierName: dto.vendorName,
    serviceName: dto.serviceLabel,
    estimatedDelivery: dto.estimatedDeliveryLabel,
    cost: dto.amount,
    logoText: dto.logoText,
  };
}

export function normalizeRajaOngkirProvince(
  item: RajaOngkirProvinceResponseItem,
): ShippingProviderProvinceDto {
  return {
    providerId: String(item.id ?? item.province_id ?? ''),
    label: String(item.name ?? item.province ?? ''),
  };
}

export function normalizeRajaOngkirCity(
  item: RajaOngkirCityResponseItem,
): ShippingProviderCityDto {
  return {
    providerId: String(item.id ?? item.city_id ?? ''),
    parentProvinceId: String(item.province_id ?? ''),
    label: String(item.name ?? item.city_name ?? item.city ?? ''),
  };
}

export function normalizeRajaOngkirDistrict(
  item: RajaOngkirDistrictResponseItem,
): ShippingProviderDistrictDto {
  return {
    providerId: String(item.id ?? item.district_id ?? ''),
    parentCityId: String(item.city_id ?? ''),
    label: String(item.name ?? item.district_name ?? item.subdistrict_name ?? ''),
    postalCode: String(item.postal_code ?? item.zip_code ?? ''),
  };
}

export function normalizeRajaOngkirRates(
  items: RajaOngkirRateCourierItem[],
): ShippingProviderRateDto[] {
  return items.flatMap((courier) => {
    const vendorCode = String(courier.code ?? '').trim();
    const vendorName = String(courier.name ?? vendorCode).trim();
    const logoText = (vendorName || vendorCode).slice(0, 3).toUpperCase();

    if (Array.isArray(courier.costs) && courier.costs.length > 0) {
      return courier.costs
        .map((service, index) => {
          const firstCost = service.cost?.[0];
          const amount = Number(firstCost?.value ?? firstCost?.amount ?? service.price ?? courier.cost ?? courier.price ?? 0);
          const serviceLabel = String(service.service ?? service.name ?? service.description ?? `Service ${index + 1}`).trim();
          const estimatedDeliveryLabel = String(service.etd ?? service.estimate ?? '').trim();

          if (!vendorCode || !vendorName || !serviceLabel || !Number.isFinite(amount) || amount <= 0) {
            return null;
          }

          return {
            providerId: `${vendorCode}-${serviceLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            vendorCode,
            vendorName,
            serviceLabel,
            estimatedDeliveryLabel,
            amount,
            logoText,
          } satisfies ShippingProviderRateDto;
        })
        .filter((item): item is ShippingProviderRateDto => Boolean(item));
    }

    const amount = Number(courier.cost ?? courier.price ?? 0);
    const serviceLabel = String(courier.service ?? courier.description ?? 'Service').trim();
    const estimatedDeliveryLabel = String(courier.etd ?? '').trim();

    if (!vendorCode || !vendorName || !serviceLabel || !Number.isFinite(amount) || amount <= 0) {
      return [];
    }

    return [{
      providerId: `${vendorCode}-${serviceLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      vendorCode,
      vendorName,
      serviceLabel,
      estimatedDeliveryLabel,
      amount,
      logoText,
    } satisfies ShippingProviderRateDto];
  });
}
