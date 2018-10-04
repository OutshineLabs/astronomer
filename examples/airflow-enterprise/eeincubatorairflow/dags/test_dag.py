# -*- coding: utf-8 -*-
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from airflow import utils
from airflow import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.http_operator import SimpleHttpOperator
from datetime import datetime, timedelta

DAG_NAME = 'test_dag_v1'
DAG_NAME2 = 'test_dag_v12'


default_args = {
    'owner': 'airflow',
    'depends_on_past': True,
    'start_date': utils.dates.days_ago(2)
}
dag = DAG(DAG_NAME, schedule_interval='@daily', default_args=default_args)
dag2 = DAG(DAG_NAME2, schedule_interval='@daily', default_args=default_args)


run_this_1 = DummyOperator(task_id='run_this_1', dag=dag)
run_this_2 = DummyOperator(task_id='run_this_2', dag=dag)
run_this_4 = DummyOperator(task_id='run_this_3', dag=dag)
run_this_3 = t9 = SimpleHttpOperator(
        task_id='getDogPicture',
        method='GET',
        http_conn_id='http_dog',
        retries=2,
        endpoint='api/breeds/image/random',
        headers={"Content-Type": "application/json"},
        xcom_push=True,
        dag=dag)

run_this_1.set_downstream(run_this_2)
run_this_2.set_downstream(run_this_3)
run_this_3.set_downstream(run_this_4)
