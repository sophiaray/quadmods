from boto.mturk.connection import MTurkConnection
from boto.mturk.question import ExternalQuestion
from boto.mturk.qualification import LocaleRequirement, PercentAssignmentsApprovedRequirement, Qualifications, NumberHitsApprovedRequirement
from config import AK,SK

HOST = "mechanicalturk.sandbox.amazonaws.com"
NUM_ITERATIONS = 10
EXPERIMENT_URL = """https://sophiaray.github.io/quadmods/quadmods.html"""

mtc = MTurkConnection(aws_access_key_id=AK, aws_secret_access_key=SK, host=HOST)

quals = Qualifications();
quals.add( PercentAssignmentsApprovedRequirement('GreaterThanOrEqualTo',95) )
quals.add( NumberHitsApprovedRequirement('GreaterThanOrEqualTo',1) )
quals.add( LocaleRequirement('EqualTo', 'US') )

new_hit = mtc.create_hit(
  hit_type=None,
  question = ExternalQuestion(EXPERIMENT_URL, 600),
  lifetime = 2*60*60, # Amount of time HIT will be available to accept unless 'max_assignments' are accepted before
  max_assignments = NUM_ITERATIONS,
  title = '$2 for 10 min. | Concept learning | University of Louisville',
  description = 'Participate in a simple psychological experiment on concept learning. The complete duration should be approximately 10 minutes (reward is estimated according to $12/hr).',
  keywords = 'concepts, learning',
  reward = 2.0,
  duration = 30*60, # Maximum amount of time turkers are allowed to spend on HIT
  approval_delay = 1*60*60, # Amount of time after which HIT is automatically approved
  questions = None,
  qualifications = quals )[0]

print(new_hit.HITId)
