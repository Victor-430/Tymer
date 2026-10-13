import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, MOCK_DATE, success, type MockSeed } from "./shared";

export function createLocationMocks(seed: MockSeed = createSeed()) {
  const orgId = seed.organization.OrganizationID;
  const location = seed.locations[0];
  const employee = seed.employees[1];
  const tags: Responses.NfcTag[] = seed.locations.map((loc, index) => ({
    TagID: `TAG-${index + 1}`, TagUID: `MOCK-NFC-${index + 1}`, OrganizationID: orgId,
    LocationID: loc.LocationID, LocationName: loc.LocationName, Address: loc.Address, IsActive: loc.IsActive,
  }));
  const access: Responses.EmployeeLocationAccess[] = seed.locations.filter((loc) => loc.IsActive).map((loc) => ({
    EmployeeCode: employee.EmployeeCode, employeename: `${employee.FirstName} ${employee.LastName}`, Email: employee.Email,
    LocationName: loc.LocationName, LocationCode: loc.LocationCode, AccessType: "ALL",
    ValidFrom: `${MOCK_DATE}T00:00:00+01:00`, ValidUntil: null, IsActive: true,
  }));
  return {
    requests: {
      viewEmployeeAccess: { employee_id: employee.EmployeeID, limit: 20, offset: 0 } satisfies Requests.ViewEmployeeAccessRequest,
      grantLocationAccess: { employee_id: employee.EmployeeID, location_ids: [101, 102], access_type: "ALL" } satisfies Requests.GrantLocationAccessRequest,
      revokeLocationAccess: { employee_id: employee.EmployeeID, location_ids: [102] } satisfies Requests.RevokeLocationAccessRequest,
      createLocation: { location_name: location.LocationName, location_code: location.LocationCode, address: location.Address, organization_id: orgId, latitude: Number(location.Latitude), longitude: Number(location.Longitude) } satisfies Requests.CreateLocationRequest,
      updateLocation: { location_id: location.LocationID, location_name: location.LocationName, is_active: true } satisfies Requests.UpdateLocationRequest,
      viewLocations: { organization_id: orgId, limit: 20, offset: 0 } satisfies Requests.ViewLocationsRequest,
      deleteLocation: { location_id: 103 } satisfies Requests.DeleteLocationRequest,
      bulkCreateLocations: [{ location_name: location.LocationName, location_code: location.LocationCode, organization_id: orgId }] satisfies Requests.BulkCreateLocationsRequest,
      createNfcTag: { tagid: tags[0].TagID, taguid: tags[0].TagUID, organization_id: orgId, is_active: true } satisfies Requests.CreateNfcTagRequest,
      viewNfcTags: { organization_id: orgId, limit: 20, offset: 0 } satisfies Requests.ViewNfcTagsRequest,
      updateNfcTag: { path: { tag_id: tags[0].TagID }, body: { location_id: location.LocationID, is_active: true } } satisfies Requests.UpdateNfcTagRequest,
      deleteNfcTag: { path: { tag_id: tags[2].TagID }, query: { confirm: true } } satisfies Requests.DeleteNfcTagRequest,
      generateQrCode: { tag_uid: tags[0].TagUID } satisfies Requests.GenerateQrCodeRequest,
      linkNfcTagToLocation: { tag_id: tags[0].TagID, location_code: location.LocationCode } satisfies Requests.LinkNfcTagToLocationRequest,
    },
    responses: {
      viewEmployeeAccess: success({ total_records: access.length, employee_access: access, limit: 20, offset: 0 }) satisfies Responses.ViewEmployeeAccessResponse,
      grantLocationAccess: success({ employee_id: employee.EmployeeID, employee_name: access[0].employeename, locations_granted: 2, total_locations_requested: 2, access_type: "ALL" }) satisfies Responses.GrantLocationAccessResponse,
      revokeLocationAccess: success({ employee_id: employee.EmployeeID, employee_name: access[0].employeename, locations_revoked: 1, total_locations_requested: 1 }) satisfies Responses.RevokeLocationAccessResponse,
      createLocation: success({ location_name: location.LocationName, location_code: location.LocationCode, organization_id: orgId }) satisfies Responses.CreateLocationResponse,
      updateLocation: success({ location_id: location.LocationID }) satisfies Responses.UpdateLocationResponse,
      viewLocations: success({ total_records: seed.locations.length, locations: seed.locations, limit: 20, offset: 0 }) satisfies Responses.ViewLocationsResponse,
      deleteLocation: success(null) satisfies Responses.DeleteLocationResponse,
      bulkCreateLocations: success({ success_count: 1, failure_count: 0, failures: [] }) satisfies Responses.BulkCreateLocationsResponse,
      createNfcTag: success({ tag_id: tags[0].TagID, tag_uid: tags[0].TagUID, organization_id: orgId }) satisfies Responses.CreateNfcTagResponse,
      viewNfcTags: success({ total_records: tags.length, nfc_tags: tags, limit: 20, offset: 0 }) satisfies Responses.ViewNfcTagsResponse,
      updateNfcTag: success({ TagID: tags[0].TagID, TagUID: tags[0].TagUID, LocationID: location.LocationID, IsActive: true, LastScannedAt: null, CreatedAt: `${MOCK_DATE}T00:00:00+01:00`, LocationName: location.LocationName, LocationCode: location.LocationCode, Address: location.Address }) satisfies Responses.UpdateNfcTagResponse,
      deleteNfcTag: success(null) satisfies Responses.DeleteNfcTagResponse,
      generateQrCode: { responseCode: "01", responseMessage: "QR image generation is unavailable in mock data.", data: null } satisfies Responses.GenerateQrCodeResponse,
      linkNfcTagToLocation: success({ tag_id: tags[0].TagID, location_code: location.LocationCode, organization_id: orgId }) satisfies Responses.LinkNfcTagToLocationResponse,
    },
    empty: {
      viewLocations: success({ total_records: 0, locations: [], limit: 20, offset: 0 }) satisfies Responses.ViewLocationsResponse,
      viewNfcTags: success({ total_records: 0, nfc_tags: [], limit: 20, offset: 0 }) satisfies Responses.ViewNfcTagsResponse,
      viewEmployeeAccess: success({ total_records: 0, employee_access: [], limit: 20, offset: 0 }) satisfies Responses.ViewEmployeeAccessResponse,
    },
  };
}
