import type {
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
