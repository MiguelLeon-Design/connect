import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import {
  CompanyTalentPoolState,
  TpJobListingEntity,
  TpJobListingEntityProps,
  TpJobListingMapper,
} from '@talent-connect/common-types'
import { deleteUndefinedProperties } from '@talent-connect/shared-utils'
import { CurrentUserInfo } from '../auth/current-user.interface'
import { SfApiTpJobListingsService } from '../salesforce-api/sf-api-tp-job-listings.service'
import { TpCompanyRepresentativeRelationshipsService } from '../tp-company-profiles/tp-company-representative-relationships.service'
import { FindAllVisibleTpJobListingsArgs } from './args/find-all-visible-tp-jobseeker-profiles.args'
import { TpJobListingCreateInput } from './dtos/tp-job-listing-create.entityinput'
import { TpJobListingDeleteInput } from './dtos/tp-job-listing-delete.entityinput'
import { TpJobListingPatchInput } from './dtos/tp-job-listing-patch.entityinput'

@Injectable()
export class TpJobListingsService {
  constructor(
    private readonly api: SfApiTpJobListingsService,
    private readonly tpCompanyRepresentativeRelationshipService: TpCompanyRepresentativeRelationshipsService,
    private readonly mapper: TpJobListingMapper
  ) {}

  async findAll(filter: any = {}) {
    const records = await this.api.getAll(filter)

    const entities = records.map((source) =>
      this.mapper.fromPersistence(source)
    )

    return entities
  }

  async findAllVisibleJobListings(_filter: FindAllVisibleTpJobListingsArgs) {
    const filter: any = {
      ['Account__r.ReDI_Visible_to_Jobseekers__c']: true,
      ['Account__r.ReDI_Talent_Pool_State__c']:
        CompanyTalentPoolState.PROFILE_APPROVED,
    }
    if (_filter.filter.relatesToPositions?.length > 0) {
      filter.Relates_to_Positions__c = {
        $includes: _filter.filter.relatesToPositions,
      }
    }
    if (_filter.filter.skills?.length > 0) {
      filter.Ideal_Technical_Skills__c = {
        $includes: _filter.filter.skills,
      }
    }
    if (_filter.filter.employmentTypes?.length > 0) {
      filter.Employment_Type__c = {
        $in: _filter.filter.employmentTypes,
      }
    }
    if (_filter.filter.federalStates?.length > 0) {
      filter.Federal_State__c = {
        $in: _filter.filter.federalStates,
      }
    }
    if (_filter.filter.isRemotePossible) {
      filter.Remote_Possible__c = true
    }
    if (_filter.filter.joinsBerlin23SummerJobFair) {
      filter['Account__r.ReDI_Joins_Berlin_23_Summer_Job_Fair__c'] =
        _filter.filter.joinsBerlin23SummerJobFair
    }
    if (_filter.filter.joinsMunich23SummerJobFair) {
      filter['Account__r.ReDI_Joins_Munich_23_Summer_Job_Fair__c'] =
        _filter.filter.joinsMunich23SummerJobFair
    }

    return await this.findAll(filter)
  }

  async findAllBelongingToCompany(companyId: string) {
    return await this.findAll({
      Account__c: companyId,
    })
  }

  async findOne(id: string) {
    const entities = await this.findAll({
      Id: id,
    })
    if (entities.length > 0) {
      return entities[0]
    } else {
      throw new NotFoundException('TpJobListing not found with id: ' + id)
    }
  }

  async create(input: TpJobListingCreateInput, user: CurrentUserInfo) {
    const props = new TpJobListingEntityProps()
    Object.assign(props, input)

    const companyRepresentedByUser =
      await this.tpCompanyRepresentativeRelationshipService.findCompanyRepresentedByUser(
        user.userId
      )
    props.companyProfileId = companyRepresentedByUser.props.id

    const entityToPersist = TpJobListingEntity.create(props)
    const recordToPersist = this.mapper.toPersistence(entityToPersist)

    return await this.api.create(recordToPersist)
  }

  async patch(input: TpJobListingPatchInput, currentUser: CurrentUserInfo) {
    const existingEntity = await this.findOne(input.id)

    const companyRepresentedByUser =
      await this.tpCompanyRepresentativeRelationshipService.findCompanyRepresentedByUser(
        currentUser.userId
      )

    if (
      existingEntity.props.companyProfileId != companyRepresentedByUser.props.id
    ) {
      throw new UnauthorizedException(
        'You are not authorized to edit this job listing.'
      )
    }

    const props = existingEntity.props
    const updatesSanitized = deleteUndefinedProperties(input)
    Object.entries(updatesSanitized).forEach(([key, value]) => {
      props[key] = value
    })
    const entityToPersist = TpJobListingEntity.create(props)
    await this.api.updateTpJobListing(
      this.mapper.toPersistence(entityToPersist)
    )
  }

  async delete(input: TpJobListingDeleteInput, currentUser: CurrentUserInfo) {
    const existingEntity = await this.findOne(input.id)
    const companyRepresentedByUser =
      await this.tpCompanyRepresentativeRelationshipService.findCompanyRepresentedByUser(
        currentUser.userId
      )

    if (
      existingEntity.props.companyProfileId != companyRepresentedByUser.props.id
    ) {
      throw new UnauthorizedException(
        'You are not authorized to edit this job listing.'
      )
    }

    const recordToDelete = this.mapper.toPersistence(existingEntity)
    await this.api.delete(recordToDelete)
  }
}
