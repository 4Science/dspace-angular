import { SubmissionObject } from '../../core/submission/models/submission-object.model';

export const mockUploadResp = [{
  'id': 11,
  'errors': [
    {
      'message': 'error.validation.required',
      'paths': [
        '/sections/publication/dc.title',
        '/sections/publication/dc.date.issued',
        '/sections/publication/dc.type'
      ]
    },
    {
      'message': 'error.validation.license.required',
      'paths': [
        '/sections/license'
      ]
    }
  ],
  'lastModified': '2024-05-22T14:25:13.853+00:00',
  'sections': {
    'unpaywall': {
      'id': 1,
      'doi': 'testDoi',
      'itemId': 'a300ad52-bae8-4ee5-8500-5f19fcc4b06f',
      'status': 'NOT_FOUND',
      'timestampCreated': '2024-05-21T15:42:42.284+00:00',
      'timestampLastModified': '2024-05-22T13:17:16.479+00:00'
    },
    'license': {
      'url': null,
      'acceptanceDate': null,
      'granted': false
    },
    'publication_references': {},
    'upload': {
      'files': [
        {
          'uuid': '66bbee9e-a3bb-48e8-9a1f-4b410a982117',
          'metadata': {
            'dc.source': [
              {
                'value': 'Lorem',
                'language': null,
                'authority': null,
                'confidence': -1,
                'place': 0
              }
            ],
            'dc.title': [
              {
                'value': 'Lorem',
                'language': null,
                'authority': null,
                'confidence': -1,
                'place': 0
              }
            ]
          },
          'accessConditions': [],
          'format': {
            'id': 1,
            'shortDescription': 'Unknown',
            'description': 'Unknown data format',
            'mimetype': 'application/octet-stream',
            'supportLevel': 'UNKNOWN',
            'internal': false,
            'extensions': [],
            'type': 'bitstreamformat'
          },
          'sizeBytes': 2815,
          'checkSum': {
            'checkSumAlgorithm': 'MD5',
            'value': 'f768a167928aa34aa5bd5cdaf83182b7'
          },
          'url': 'http://localhost:8080/server/api/core/bitstreams/66bbee9e-a3bb-48e8-9a1f-4b410a982117/content'
        }
      ]
    },
    'publication': {
      'dc.identifier.doi': [
        {
          'value': 'testDoi',
          'language': null,
          'authority': null,
          'confidence': -1,
          'place': 0
        }
      ]
    },
    'publication_indexing': {},
    'detect-duplicate': {},
    'collection': 'edf8bcdc-82fd-42be-aaa1-084df50679d2',
    'publication_bibliographic_details': {}
  },
  'type': 'workspaceitem',
  '_links': {
    'supervisionOrders': {
      'href': 'http://localhost:8080/server/api/submission/workspaceitems/11/supervisionOrders'
    },
    'collection': {
      'href': 'http://localhost:8080/server/api/submission/workspaceitems/11/collection'
    },
    'item': {
      'href': 'http://localhost:8080/server/api/submission/workspaceitems/11/item'
    },
    'submissionDefinition': {
      'href': 'http://localhost:8080/server/api/submission/workspaceitems/11/submissionDefinition'
    },
    'submitter': {
      'href': 'http://localhost:8080/server/api/submission/workspaceitems/11/submitter'
    },
    'self': {
      'href': 'http://localhost:8080/server/api/submission/workspaceitems/11'
    }
  },
  '_embedded': {
    'submitter': {
      'id': '09797784-2424-458f-898c-4f85b536744c',
      'uuid': '09797784-2424-458f-898c-4f85b536744c',
      'name': 'admin',
      'handle': null,
      'metadata': {
        'dspace.agreements.cookies': [
          {
            'value': '{"authentication":true,"preferences":true,"acknowledgement":true,"plumX":true,"altmetric":true,"dimensions":true}',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'dspace.agreements.end-user': [
          {
            'value': 'true',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'eperson.firstname': [
          {
            'value': 'admin',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'eperson.language': [
          {
            'value': 'en',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'eperson.lastname': [
          {
            'value': 'admin',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ]
      },
      'netid': null,
      'lastActive': '2024-05-22T13:58:39.848+00:00',
      'canLogIn': true,
      'email': 'admin',
      'requireCertificate': false,
      'selfRegistered': false,
      'machineTokenGenerated': false,
      'type': 'eperson',
      '_links': {
        'groups': {
          'href': 'http://localhost:8080/server/api/eperson/epersons/09797784-2424-458f-898c-4f85b536744c/groups'
        },
        'self': {
          'href': 'http://localhost:8080/server/api/eperson/epersons/09797784-2424-458f-898c-4f85b536744c'
        }
      }
    },
    'item': {
      'id': 'a300ad52-bae8-4ee5-8500-5f19fcc4b06f',
      'uuid': 'a300ad52-bae8-4ee5-8500-5f19fcc4b06f',
      'name': null,
      'handle': null,
      'metadata': {
        'dc.identifier.doi': [
          {
            'value': 'testDoi',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'dspace.entity.type': [
          {
            'value': 'Publication',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ]
      },
      'inArchive': false,
      'discoverable': true,
      'withdrawn': false,
      'lastModified': '2024-05-22T14:25:13.853+00:00',
      'entityType': 'Publication',
      'type': 'item',
      '_links': {
        'accessStatus': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/accessStatus'
        },
        'bundles': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/bundles'
        },
        'identifiers': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/identifiers'
        },
        'mappedCollections': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/mappedCollections'
        },
        'owningCollection': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/owningCollection'
        },
        'relationships': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/relationships'
        },
        'version': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/version'
        },
        'templateItemOf': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/templateItemOf'
        },
        'metrics': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/metrics'
        },
        'thumbnail': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f/thumbnail'
        },
        'self': {
          'href': 'http://localhost:8080/server/api/core/items/a300ad52-bae8-4ee5-8500-5f19fcc4b06f'
        }
      }
    },
    'submissionDefinition': {
      'id': 'publication',
      'name': 'publication',
      'type': 'submissiondefinition',
      'isDefault': true,
      '_links': {
        'collections': {
          'href': 'http://localhost:8080/server/api/config/submissiondefinitions/publication/collections'
        },
        'sections': {
          'href': 'http://localhost:8080/server/api/config/submissiondefinitions/publication/sections'
        },
        'self': {
          'href': 'http://localhost:8080/server/api/config/submissiondefinitions/publication'
        }
      }
    },
    'collection': {
      'id': 'edf8bcdc-82fd-42be-aaa1-084df50679d2',
      'uuid': 'edf8bcdc-82fd-42be-aaa1-084df50679d2',
      'name': 'Publication',
      'handle': '20.500.14171/7',
      'metadata': {
        'cris.submission.definition': [
          {
            'value': 'publication',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'dc.identifier.uri': [
          {
            'value': 'http://localhost:4000/handle/20.500.14171/7',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'dc.title': [
          {
            'value': 'Publication',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ],
        'dspace.entity.type': [
          {
            'value': 'Publication',
            'language': null,
            'authority': null,
            'confidence': -1,
            'place': 0
          }
        ]
      },
      'archivedItemsCount': -1,
      'type': 'collection',
      '_links': {
        'harvester': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/harvester'
        },
        'itemtemplate': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/itemtemplate'
        },
        'license': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/license'
        },
        'logo': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/logo'
        },
        'mappedItems': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/mappedItems'
        },
        'parentCommunity': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/parentCommunity'
        },
        'adminGroup': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/adminGroup'
        },
        'submittersGroup': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/submittersGroup'
        },
        'itemReadGroup': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/itemReadGroup'
        },
        'bitstreamReadGroup': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/bitstreamReadGroup'
        },
        'self': {
          'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2'
        },
        'workflowGroups': [
          {
            'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/workflowGroups/reviewer',
            'name': 'reviewer'
          },
          {
            'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/workflowGroups/editor',
            'name': 'editor'
          },
          {
            'href': 'http://localhost:8080/server/api/core/collections/edf8bcdc-82fd-42be-aaa1-084df50679d2/workflowGroups/finaleditor',
            'name': 'finaleditor'
          }
        ]
      }
    }
  }
}] as any as SubmissionObject[];
