from boto.mturk.connection import MTurkConnection
from boto.mturk.question import ExternalQuestion
from boto.mturk.qualification import LocaleRequirement, PercentAssignmentsApprovedRequirement, Qualifications, NumberHitsApprovedRequirement
from config import AK,SK

SANDBOX = True

HOST = {True: "mechanicalturk.sandbox.amazonaws.com",
        False: "mechanicalturk.amazonaws.com"}[SANDBOX]
NUM_ITERATIONS = 10
EXPERIMENT_URL = """https://sophiaray.github.io/quadmods/abstract.html?shapeCond=Rh,S&condition=label-order"""

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
  title = '$3 for 15 min. | Concept learning | University of Louisville',
  description = 'Participate in a simple psychological experiment on concept learning. The complete duration should be approximately 15 minutes (reward is estimated according to $12/hr).',
  keywords = 'concepts, learning',
  reward = 3.0,
  duration = 45*60, # Maximum amount of time turkers are allowed to spend on HIT
  approval_delay = 1*60*60, # Amount of time after which HIT is automatically approved
  questions = None,
  qualifications = quals )[0]


manage_base_url = {
    True: "requestersandbox.mturk.com",
    False: "requester.mturk.com"
}[SANDBOX]


print("""
Great work! Manage your hit at  https://{}/mturk/manageHIT?viewableEditPane=manageHIT_downloadResults&HITId={}
""".format(manage_base_url,new_hit.HITId))
